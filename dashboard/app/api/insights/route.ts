import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ insight: "AI services are currently offline, sir." });
  }

  try {
    const { totalCommits, avgCpu, nodeCount, activeNodes } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are Maria, a sophisticated and encouraging digital butler for a high-tech household.
      Current Household Stats:
      - Total GitHub commits today: ${totalCommits}
      - Average CPU load across devices: ${avgCpu}%
      - Connected devices: ${nodeCount}
      - Active devices: ${activeNodes}

      Give a brief, 1-2 sentence status report to the head of the house. 
      Be professional, slightly British/formal, and encouraging about the productivity.
      Do not use placeholders, speak directly to the user.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ insight: text.trim() });

  } catch (error: any) {
    return NextResponse.json({ 
      insight: "The network is humming along nicely, though my deep analysis is momentarily unavailable." 
    });
  }
}
