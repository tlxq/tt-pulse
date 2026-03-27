import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const runtime = 'edge'; // Använd Edge Runtime för snabbare svarstider om möjligt
export const maxDuration = 10; // Tvinga 10s limit för att matcha Vercel Free

export async function POST() {
  try {
    // 1. Hämta data från Supabase
    const { data: nodes, error } = await supabase
      .from("node_status")
      .select("*");

    if (error || !nodes) throw new Error("Could not fetch node data");

    // 2. Förbered prompten
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze these system nodes and give a 2-sentence professional status summary: ${JSON.stringify(nodes)}`;

    // 3. Hantera timeout med Promise.race
    const aiPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI Timeout")), 8500) // Bryt efter 8.5s
    );

    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ insight: text });

  } catch (error: any) {
    console.error("Insight error:", error);
    
    // Graceful fallback om AI:n är för långsam eller saknar nyckel
    return NextResponse.json({ 
      insight: "System monitoring active. All nodes reporting heartbeats to Supabase. (AI Insights currently unavailable)",
      error: error.message 
    }, { status: 200 }); // Skicka 200 ändå så att UI inte dör
  }
}
