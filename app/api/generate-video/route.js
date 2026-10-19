import { Client } from "@gradio/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const jsonError = (message, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.");
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const maxLength = Number.parseInt(process.env.MAX_PROMPT_LENGTH || "1000", 10);

  if (prompt.length < 3) return jsonError("Enter a prompt with at least 3 characters.");
  if (prompt.length > maxLength) return jsonError(`Prompt must be ${maxLength} characters or fewer.`);

  const spaceId = process.env.VIDEO_SPACE_ID?.trim();
  const apiName = process.env.VIDEO_API_NAME?.trim() || "/predict";
  const token = process.env.HF_TOKEN?.trim();

  if (!spaceId) {
    return jsonError("The site owner has not configured VIDEO_SPACE_ID yet.", 503);
  }

  try {
    const client = await Client.connect(spaceId, token ? { hf_token: token } : {});
    // This generic starter assumes the Space accepts one string input: the prompt.
    // Match this call to the endpoint and inputs shown in that Space's "Use via API" panel.
    const result = await client.predict(apiName, [prompt]);

    return NextResponse.json({
      ok: true,
      space: spaceId,
      result: result?.data ?? result
    });
  } catch (error) {
    console.error("Gradio video generation error:", error?.message || error);
    return jsonError(
      "The configured Space failed. Verify its API endpoint and input parameters, and check whether free access is currently available. No paid fallback is enabled.",
      502
    );
  }
}
