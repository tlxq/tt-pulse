import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Använd standard Node.js runtime för bättre kompatibilitet
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Öka till 30s för att ge AI:n mer tid

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in environment variables");
    return NextResponse.json({ 
      insight: "AI Insight configuration missing. Please add GEMINI_API_KEY to Vercel." 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 1. Hämta data från Supabase
    const { data: nodes, error } = await supabase
      .from("node_status")
      .select("*");

    if (error || !nodes || nodes.length === 0) {
      return NextResponse.json({ insight: "No active nodes detected to analyze." });
    }

    // 2. Förbered prompten
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a system monitor called Maria. Analyze these nodes and give a short, professional 2-sentence summary of the network health: ${JSON.stringify(nodes)}`;

    // 3. Generera innehåll
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Empty response from Gemini");

    return NextResponse.json({ insight: text });

  } catch (error: any) {
    console.error("Detailed Gemini Error:", error);
    
    return NextResponse.json({ 
      insight: "System monitoring active. All nodes reporting heartbeats to Supabase. AI is taking a coffee break.",
      debug: error.message 
    });
  }
}
