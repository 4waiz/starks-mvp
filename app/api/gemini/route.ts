import { NextRequest, NextResponse } from "next/server";

import { inputSchema, motionSpecSchema, type MotionSpec } from "@/lib/motion-schema";

const MODEL_NAME = "gemini-1.5-flash";
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

function getClientId(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(clientId: string) {
  const now = Date.now();
  const existing = buckets.get(clientId);

  if (!existing || existing.resetAt < now) {
    buckets.set(clientId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= RATE_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  buckets.set(clientId, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const data = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text || "").join("").trim();
}

function cleanJsonString(value: string) {
  return value
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

async function requestGemini(prompt: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 20,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Gemini request failed");
  }

  return response.json();
}

function buildPrompt(input: {
  styleText: string;
  actionText: string;
  engine: "unity" | "unreal" | "blender";
  rigType: "humanoid";
  toggles: {
    noFootSliding: boolean;
    contactConstraints: boolean;
    limpLeftLeg: boolean;
  };
}) {
  return `You are a motion generation specification engine.
Return STRICT JSON only.
Do not include markdown, explanations, comments, or code fences.

Required schema (must match exactly):
{
  "style_tags": [],
  "action_tags": [],
  "tempo_bpm": number,
  "constraints": { "no_foot_sliding": true, "contact_points": ["feet"], "limp_left_leg": false },
  "rig_notes": [],
  "engine": "unity|unreal|blender",
  "export": { "formats": ["FBX","BVH"], "retargeting": "humanoid" },
  "quality_checks": ["no_foot_sliding","clean_contacts","stable_timing"]
}

Input:
- style text: "${input.styleText}"
- action text: "${input.actionText}"
- engine: "${input.engine}"
- rig type: "${input.rigType}"
- toggles.no_foot_sliding: ${String(input.toggles.noFootSliding)}
- toggles.contact_constraints: ${String(input.toggles.contactConstraints)}
- toggles.limp_left_leg: ${String(input.toggles.limpLeftLeg)}

Rules:
- Keep style_tags and action_tags concise lower_snake_case tags.
- tempo_bpm should be plausible for the action.
- constraints.contact_points should include feet when contact constraints are on, otherwise can be [].
- engine must exactly match the input engine.
- export.formats must include both "FBX" and "BVH".
- export.retargeting must be "humanoid".
- quality_checks should include no_foot_sliding, clean_contacts, stable_timing.
`;
}

function buildSummary(spec: MotionSpec) {
  const style = spec.style_tags.slice(0, 3).join(", ") || "custom style";
  const action = spec.action_tags.slice(0, 3).join(", ") || "custom action";
  const points = spec.constraints.contact_points.length
    ? spec.constraints.contact_points.join(", ")
    : "none";

  return `Motion spec ready: ${action} in ${style} at ${spec.tempo_bpm} BPM, constraints on ${points}, export FBX/BVH for ${spec.engine}.`;
}

async function parseGeminiToSpec(prompt: string, apiKey: string): Promise<MotionSpec> {
  const first = await requestGemini(prompt, apiKey);
  const firstText = cleanJsonString(extractText(first));

  try {
    const parsed = JSON.parse(firstText);
    const validated = motionSpecSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
  } catch {
    // Retry below.
  }

  const retryPrompt = `${prompt}\nReturn valid JSON only.`;
  const second = await requestGemini(retryPrompt, apiKey);
  const secondText = cleanJsonString(extractText(second));

  const parsed = JSON.parse(secondText);
  const validated = motionSpecSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Gemini returned invalid JSON shape.");
  }
  return validated.data;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY." },
      { status: 500 },
    );
  }

  const clientId = getClientId(request);
  const limit = checkRateLimit(clientId);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
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

  const parsedInput = inputSchema.safeParse(rawBody);
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "Invalid input payload.", details: parsedInput.error.flatten() },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(parsedInput.data);

  try {
    const motionSpec = await parseGeminiToSpec(prompt, apiKey);
    return NextResponse.json({
      summary: buildSummary(motionSpec),
      motionSpec,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
