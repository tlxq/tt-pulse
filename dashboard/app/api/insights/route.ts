import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    const { nodes, forceRefresh } = await req.json();
    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ insight: "Infrastructure silent. No telemetry nodes detected." });
    }

    const onlineNodes = nodes.filter((n: any) => n.online);
    const activeNode = onlineNodes[0] || nodes[0];

    // 1. Smart Caching Layer (15-min TTL)
    const cacheAge = activeNode.last_ai_timestamp 
      ? (Date.now() - new Date(activeNode.last_ai_timestamp).getTime()) / (1000 * 60)
      : 999;

    if (!forceRefresh && cacheAge < 15 && activeNode.last_ai_insight) {
      return NextResponse.json({ insight: activeNode.last_ai_insight, cached: true });
    }

    // 2. Native REST Call to Gemini v1 (Stability First)
    if (apiKey && onlineNodes.length > 0) {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const prompt = {
        contents: [{
          parts: [{
            text: `You are Texas, a Senior SRE for the TT-Pulse household. 
            Analyze this telemetry: ${JSON.stringify(nodes.map((n: any) => ({ name: n.node_name, cpu: n.cpu_usage, disk: n.disk_usage_percent, online: n.online })))}.
            Provide a 3-sentence 'Daily Standup' report. Identify the most critical node and issue a sarcastic but technical warning. 
            Tone: Sophisticated British SRE.`
          }]
        }]
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt)
      });

      if (res.ok) {
        const data = await res.json();
        const insight = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Telemetry nominal, sir.";

        // 3. Cache Persistence: Save back to node_status for sub-second future responses
        await supabase
          .from('node_status')
          .update({ 
            last_ai_insight: insight, 
            last_ai_timestamp: new Date().toISOString() 
          })
          .in('node_name', onlineNodes.map((n: any) => n.node_name));

        return NextResponse.json({ insight, cached: false });
      }
    }

    // 4. SRE Fallback Rule Engine (Deterministic Resilience)
    const criticalNode = nodes.reduce((prev: any, curr: any) => (prev.cpu > curr.cpu) ? prev : curr);
    const fallback = `[SRE FALLBACK] System load at ${activeNode.cpu}%. ${onlineNodes.length} nodes operational. ${criticalNode.name} identified as workhorse.`;
    
    return NextResponse.json({ insight: fallback, fallback: true });

  } catch (error) {
    console.error("Critical SRE Insight Failure:", error);
    return NextResponse.json({ insight: "Infrastructure is humming, but analytical circuits are offline." });
  }
}
