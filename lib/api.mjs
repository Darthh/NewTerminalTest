const noStore = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function jsonResponse(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { ...noStore, ...headers } });
}

export function errorResponse(error) {
  return jsonResponse(
    {
      error:
        error instanceof ApiError
          ? error.message
          : "The request could not be completed. Try again.",
    },
    error instanceof ApiError ? error.status : 500,
  );
}

export function validateOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const runtimeUrl = new URL(request.url);
  if (origin === runtimeUrl.origin || origin === process.env.APP_ORIGIN) return;
  // Next's local server may normalize 127.0.0.1 to localhost in Request.url.
  // Treat only literal loopback aliases with the same protocol/port as equivalent.
  const loopbacks = new Set(["localhost", "127.0.0.1", "[::1]"]);
  try {
    const browserUrl = new URL(origin);
    if (
      browserUrl.origin === origin &&
      loopbacks.has(runtimeUrl.hostname) &&
      loopbacks.has(browserUrl.hostname) &&
      runtimeUrl.port === browserUrl.port &&
      runtimeUrl.protocol === browserUrl.protocol
    )
      return;
  } catch {}
  throw new ApiError("This request must originate from Luna Terminal.", 403);
}

/** Bound before JSON parsing, including bodies sent without Content-Length. */
export async function readJson(request, maxBytes = 4 * 1024 * 1024) {
  if (
    !/^application\/json(?:;|$)/i.test(
      request.headers.get("content-type") || "",
    )
  )
    throw new ApiError("Use Content-Type: application/json.", 415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes)
    throw new ApiError("The request exceeds the 4 MB limit.", 413);
  if (!request.body) throw new ApiError("A JSON request body is required.");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new ApiError("The request exceeds the 4 MB limit.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const value = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(buffer),
    );
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("not an object");
    return value;
  } catch {
    throw new ApiError("Provide a valid JSON object.");
  }
}

/** Local preview quota; intentionally one shared anonymous bucket, without trusting caller IP headers. */
export function createRateLimiter(limit = 15, windowMs = 60 * 60 * 1000) {
  const buckets = new Map();
  return (key = "anonymous", now = Date.now()) => {
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    if (bucket.count >= limit)
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    bucket.count += 1;
    return {
      allowed: true,
      remaining: limit - bucket.count,
      resetAt: bucket.resetAt,
    };
  };
}

export const chatQuota = createRateLimiter(
  Math.min(
    100,
    Math.max(1, Number(process.env.LUNA_ANONYMOUS_HOURLY_LIMIT) || 15),
  ),
);
export const publicQuota = createRateLimiter(100);

export function normalizeSymbol(value) {
  if (typeof value !== "string" || !/^[A-Za-z][A-Za-z0-9.-]{0,9}$/.test(value))
    throw new ApiError("Use a valid ticker such as NVDA or SPY.");
  return value.toUpperCase();
}

export const HISTORY_RANGES = [
  "1D",
  "5D",
  "1M",
  "3M",
  "6M",
  "1Y",
  "2Y",
  "3Y",
  "5Y",
  "10Y",
];

export function normalizeRange(value = "1Y") {
  if (!HISTORY_RANGES.includes(value))
    throw new ApiError(`Supported ranges: ${HISTORY_RANGES.join(", ")}.`);
  return value;
}

export function unavailableAccount() {
  return jsonResponse(
    {
      error:
        "Account storage is unavailable in this local preview. Your browser drafts remain available on this device.",
      code: "ACCOUNT_STORAGE_UNAVAILABLE",
    },
    503,
  );
}
