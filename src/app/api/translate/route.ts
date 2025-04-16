import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitize";

export async function POST(req: NextRequest) {
  const { text, targetLang, sourceLang } = await req.json();

  const cleanText = sanitizeInput(text);
  const cleanTargetLang = sanitizeInput(targetLang);
  const cleanSourceLang = sanitizeInput(sourceLang);

  if (!cleanText || !cleanTargetLang) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const prompt = `Translate the following medical-related text from """${cleanSourceLang}""" to """${cleanTargetLang}""":
"""
${cleanText}
"""`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content:
              "You are a medical transcription assistant. Your job is to replace any names of patients, names of doctors, or names of addresses with anonymized placeholders like [The patient], [The doctor], or [The address], improve medical terminology where appropriate, and return only the cleaned and anonymized transcript. If a speaker says 'My name is…' or 'I’m Doctor…', replace the name with the appropriate placeholder.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ translation });
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
