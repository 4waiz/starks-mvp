import type { DemoInput, MotionResponse } from "@/lib/motion-schema";

export async function generateMotionSpec(payload: DemoInput): Promise<MotionResponse> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const fallback = "Failed to generate motion spec.";
    try {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return (await response.json()) as MotionResponse;
}
