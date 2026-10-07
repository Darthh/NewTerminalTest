import {
  chatQuota,
  errorResponse,
  jsonResponse,
  readJson,
  validateOrigin,
} from "../../../lib/api.mjs";
import {
  streamResearch,
  validateChatRequest,
} from "../../../lib/chat-engine.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    validateOrigin(request);
    const input = validateChatRequest(await readJson(request));
    const quota = chatQuota();
    if (!quota.allowed)
      return jsonResponse(
        {
          error:
            "Local research has reached its hourly preview limit. Try again later.",
          code: "RATE_LIMITED",
        },
        429,
        { "Retry-After": String(quota.retryAfter) },
      );
    return new Response(streamResearch(input, request.signal), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
