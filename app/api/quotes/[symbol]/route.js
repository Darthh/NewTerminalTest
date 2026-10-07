import {
  errorResponse,
  jsonResponse,
  normalizeSymbol,
} from "../../../../lib/api.mjs";
import { getQuote } from "../../../../lib/chat-engine.mjs";

export async function GET(request, { params }) {
  try {
    return jsonResponse(getQuote(normalizeSymbol((await params).symbol)));
  } catch (error) {
    return errorResponse(error);
  }
}
