import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { founder, content } = await req.json();

    // 1. Save the new log to Firestore
    const logRef = await addDoc(collection(db, "logs"), {
      founder,
      content,
      timestamp: new Date().toISOString(),
    });

    // 2. Fetch the last 10 logs to give Gemini context
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const recentLogs = querySnapshot.docs.map(doc => `${doc.data().founder}: ${doc.data().content}`);

    // 3. Prompt Gemini 1.5 Flash with JSON mode
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });
    
    const prompt = `
      You are an AI intelligence layer for a startup. Your goal is to reduce cognitive load by detecting operational conflicts.
      Recent History:
      ${recentLogs.join("\n")}
      
      New Action: ${founder}: ${content}
      
      Analyze the new action. Does it directly conflict with recent history regarding promises to investors, feature priorities, or internal timelines?
      If YES, return: { "hasConflict": true, "summary": "Explanation of the drift", "resolution": "Suggested action" }
      If NO, return: { "hasConflict": false }
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = JSON.parse(result.response.text());

    // 4. Save detected conflicts
    if (aiResponse.hasConflict) {
      await addDoc(collection(db, "conflicts"), {
        summary: aiResponse.summary,
        resolution: aiResponse.resolution,
        status: "active",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, aiResponse });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
