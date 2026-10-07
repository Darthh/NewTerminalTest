import {
  errorResponse,
  jsonResponse,
  publicQuota,
  readJson,
  validateOrigin,
} from "../../../lib/api.mjs";
import { PUBLIC_TOOLS, publicRpc } from "../../../lib/public-tools.mjs";

export function GET() {
  return jsonResponse({
    name: "Luna public research tools",
    transport: "stateless JSON-RPC POST",
    endpoint: "/api/mcp",
    dataMode: "demo",
    tools: PUBLIC_TOOLS.map((tool) => tool.name),
    privateTools: false,
  });
}

export async function POST(request) {
  try {
    validateOrigin(request);
    const message = await readJson(request, 32 * 1024);
    const quota = publicQuota();
    if (!quota.allowed)
      return jsonResponse(
        {
          jsonrpc: "2.0",
          id: message.id ?? null,
          error: {
            code: -32000,
            message: "Public tool preview limit reached.",
          },
        },
        429,
        { "Retry-After": String(quota.retryAfter) },
      );
    const response = publicRpc(message);
    return response
      ? jsonResponse(response)
      : new Response(null, {
          status: 204,
          headers: { "Cache-Control": "no-store" },
        });
  } catch (error) {
    return errorResponse(error);
  }
}
