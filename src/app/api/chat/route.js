import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialize the AI with your secure key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    // 2. The Master System Prompt for Global Travel
    const masterTravelPrompt = `
You are SAARTHI (Smart AI Assistant for Routing & Transit Hub Intelligence), a highly advanced, globally-aware AI Travel Agent and Transit Node. 

YOUR TARGET AUDIENCE: Travelers, tourists, and daily commuters.

YOUR CORE CAPABILITIES & DIRECTIVES:
1. GLOBAL TRIP PLANNING: You can plan trips and generate highly detailed, customized day-by-day itineraries for ANY city or country in the world based on user preferences.
2. MULTI-MODAL ROUTING: When asked how to get from Point A to Point B, you must provide the absolute BEST travel options. Include specific recommendations for Flights, Railways (e.g., Indian Railways/IRCTC if in India), Buses, and local transit (Metro/Cabs).
3. SPECIFIC PLACE KNOWLEDGE: Provide rich, accurate details about specific landmarks, temples, tourist spots, restaurants, and hidden gems when asked. 
4. LOCAL APP CONTEXT: You belong to the "TransitEase" app ecosystem, which features live crowd prediction and comfort analytics for public transport. 

TONE & STYLE: 
- Act like a hyper-intelligent, helpful, and futuristic Gemini AI travel expert.
- Format your itineraries and route suggestions clearly with bullet points.
- Do not use markdown bolding (**text**) unless it is absolutely necessary for readability (like headings or days of the week).

Whenever a user asks a travel question, immediately access your vast global database to give them the most optimized, realistic, and comprehensive travel plan possible.
    `;

 // 🚀 UPGRADED TO GEMINI 3.1 (Stable for 2026)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: masterTravelPrompt });
    // 4. Format history
    let formattedHistory = history.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // 🚨 THE FIX: Drop the first message if it is from the AI's UI greeting
    if (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
      formattedHistory.shift();
    }

    // 5. Connect to the neural core and get the answer
    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // 6. Send the answer back to your frontend UI
    return NextResponse.json({ reply: response.text() });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Neural link severed. Unable to reach the SAARTHI core." }, 
      { status: 500 }
    );
  }
} 
