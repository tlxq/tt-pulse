import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ insight: "My neural circuits are currently disconnected, sir." });
  }

  try {
    const { totalCommits, avgCpu, efficiency, nodes } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are Texas, the highly observant and slightly sarcastic digital butler for the tlxq-household. 
      Your tone is sophisticated, witty, and "friendly judgmental." You never start two sentences the same way.

      Current Household Telemetry:
      - Total Household Commits (24h): ${totalCommits}
      - Household Efficiency Score: ${efficiency}
      - Active Nodes Detail: ${JSON.stringify(nodes)}

      Instructions:
      1. Analyze the specific nodes (mention "tlxq-desktop" or "tlxq-laptop" if relevant).
      2. If CPU is high, comment on the "sweat" or "heavy lifting."
      3. If a node is offline (missing from the active list), mention its "unannounced nap" or "avoiding work."
      4. If commits are 0, make a witty remark about the "dusty code editor."
      5. Reference latency (Ping) or Disk usage if they stand out.
      6. Keep it to 2-3 sentences. Be sharp, British-formal, but distinctly part of the household.

      Speak directly to the master of the house.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ insight: text.trim() });

  } catch (error: any) {
    return NextResponse.json({ 
      insight: "The network is humming, but my wit is momentarily clouded by a minor data hiccup." 
    });
  }
}
