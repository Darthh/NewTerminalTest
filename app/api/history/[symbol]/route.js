import {
  errorResponse,
  jsonResponse,
  normalizeRange,
  normalizeSymbol,
} from "../../../../lib/api.mjs";
import { getHistory } from "../../../../lib/chat-engine.mjs";

export async function GET(request, { params }) {
  try {
    const symbol = normalizeSymbol((await params).symbol);
    const range = normalizeRange(
      new URL(request.url).searchParams.get("range") || "1Y",
    );
    return jsonResponse(getHistory(symbol, range));
  } catch (error) {
    return errorResponse(error);
  }
}
