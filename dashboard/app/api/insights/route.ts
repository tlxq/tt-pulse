import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// SRE Inställningar - Justerade för att maximera Free Tier-livslängd
const CACHE_TTL_MINUTES = 60;
const PRIMARY_MODEL = 'gemini-2.0-flash';

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const body = await req.json();
    const { nodes, commits, forceRefresh } = body;

    // 1. Snabb-validering
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json({ insight: 'Infrastructure silent, sir.' });
    }

    // 2. Data Alignment (Bantad payload för att spara tokens)
    const mappedNodes = nodes.map((n: any) => ({
      name: n.node_name || n.name || 'unknown',
      cpu: n.cpu_usage ?? n.cpu ?? 0,
      online: !!n.online,
    }));

    const onlineNodes = mappedNodes.filter((n: any) => n.online);
    const activeNode = onlineNodes[0] || mappedNodes[0];

    // 3. Aggressiv SRE Caching (Sparar Quota)
    const { data: cachedData } = await supabase
      .from('node_status')
      .select('last_ai_insight, last_ai_timestamp')
      .eq('node_name', activeNode.name)
      .single();

    const cacheAge = cachedData?.last_ai_timestamp
      ? (Date.now() - new Date(cachedData.last_ai_timestamp).getTime()) /
        (1000 * 60)
      : 999;

    if (
      !forceRefresh &&
      cacheAge < CACHE_TTL_MINUTES &&
      cachedData?.last_ai_insight
    ) {
      console.log(
        `[SRE] Cache Hit (${Math.round(cacheAge)}m old). Respecting Rate Limits.`,
      );
      return NextResponse.json({
        insight: cachedData.last_ai_insight,
        cached: true,
      });
    }

    // 4. AI Dispatcher med Quota-Guard
    if (apiKey && onlineNodes.length > 0) {
      // Vi provar 2.0 först på den stabila v1-routen
      const modelsToTry = [PRIMARY_MODEL, 'gemini-1.5-flash'];

      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

          const payload = {
            contents: [
              {
                parts: [
                  {
                    text: `SRE Standup. Nodes: ${JSON.stringify(mappedNodes)}. Recent: ${JSON.stringify((commits || []).slice(0, 3))}. 3 witty British sentences max.`,
                  },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 150 }, // Håller nere kostnaden/tokens
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.status === 429) {
            console.warn(
              `[SRE] Rate Limit Exceeded (429) for ${modelName}. Tactical retreat to fallback.`,
            );
            break; // Sluta försöka om vi är spärrade
          }

          if (res.ok) {
            const data = await res.json();
            const insight =
              data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (insight) {
              console.log(
                `[SRE] Insight generated via ${modelName}. Updating node_status cache.`,
              );

              const nodeNames = onlineNodes.map((n) => n.name);
              await supabase
                .from('node_status')
                .update({
                  last_ai_insight: insight,
                  last_ai_timestamp: new Date().toISOString(),
                })
                .in('node_name', nodeNames);

              return NextResponse.json({
                insight,
                cached: false,
                model: modelName,
              });
            }
          }

          console.log(
            `[SRE] Model ${modelName} returned ${res.status}. Trying next...`,
          );
        } catch (e) {
          console.error(`[SRE] Dispatch error for ${modelName}:`, e);
        }
      }
    }

    // 5. Deterministic Fallback (Visas när Quota är slut)
    const workhorse = mappedNodes.reduce((prev: any, curr: any) =>
      prev.cpu > curr.cpu ? prev : curr,
    );

    const fallback = `[SRE FALLBACK] Systems nominal at ${activeNode.cpu}% load. The AI link is currently throttled by Google, but ${workhorse.name} is clearly doing the heavy lifting while I brew some digital tea.`;

    return NextResponse.json({
      insight: fallback,
      fallback: true,
      quotaExceeded: true,
    });
  } catch (error: any) {
    console.error('CRITICAL_SRE_FAILURE:', error);
    return NextResponse.json({
      insight:
        'Analytical circuits are offline. Systems remain operational, sir.',
    });
  }
}
