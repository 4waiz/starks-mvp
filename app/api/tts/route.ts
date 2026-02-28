import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

const requestSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  voice: z.enum(["Kore", "Puck", "Aoede", "Charon"]).optional(),
  style: z.string().trim().min(1).max(80).optional(),
});

function getClientId(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(clientId: string) {
  const now = Date.now();
  const current = buckets.get(clientId);

  if (!current || current.resetAt < now) {
    buckets.set(clientId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  buckets.set(clientId, current);
  return { allowed: true, retryAfter: 0 };
}

function stripMarkdownForSpeech(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractInlineAudio(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: {
            mimeType?: string;
            data?: string;
          };
        }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const audioPart = parts.find((part) => part.inlineData?.data);
  if (!audioPart?.inlineData?.data) return null;

  return {
    audioBase64: audioPart.inlineData.data,
    mimeType: audioPart.inlineData.mimeType ?? "audio/wav",
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is missing GEMINI_API_KEY." }, { status: 500 });
  }

  const clientId = getClientId(request);
  const limit = checkRateLimit(clientId);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter),
        },
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const cleanText = stripMarkdownForSpeech(parsed.data.text).slice(0, 1000);
  if (!cleanText) {
    return NextResponse.json({ error: "No speakable text found." }, { status: 400 });
  }

  const voice = parsed.data.voice ?? "Puck";
  const speechText = parsed.data.style
    ? `Speak in a ${parsed.data.style} tone. ${cleanText}`
    : cleanText;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: speechText }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
          },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Gemini TTS request failed.");
    }

    const data = await response.json();
    const audio = extractInlineAudio(data);
    if (!audio) {
      throw new Error("Gemini TTS response did not include audio.");
    }

    return NextResponse.json(audio);
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
