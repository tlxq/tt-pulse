import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    // 1. Check AI Cache (30 min)
    const { data: cache } = await supabase.from('ai_insights').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (cache && (new Date().getTime() - new Date(cache.created_at).getTime()) < 30 * 60 * 1000) {
      return NextResponse.json({ insight: cache.insight_text });
    }

    // 2. Fetch Fresh Data
    const { data: nodes } = await supabase.from('node_status').select('*');
    if (!nodes || nodes.length === 0) return NextResponse.json({ insight: "Waiting for pulse data..." });

    const summary = nodes.map(n => `${n.node_name}: CPU ${n.cpu_usage}%, RAM ${n.ram_usage}%, Git ${n.git_commits}`).join('\n');
    
    // UPDATED FOR 2026: Using Gemini 2.5 Flash (Stable)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });
    
    const result = await model.generateContent(`You are Jarvis, a loyal and intelligent AI butler monitoring a home-lab. Based on this data, provide a professional 2-sentence summary in English: ${summary}`);
    const text = result.response.text().trim();

    // 3. Save to Cache
    await supabase.from('ai_insights').insert([{ insight_text: text }]);
    return NextResponse.json({ insight: text });

  } catch (error: any) {
    console.error("AI Error:", error.message);
    return NextResponse.json({ insight: "System nominal. AI is resting." });
  }
}
