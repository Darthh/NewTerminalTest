import { jsonResponse } from "../../../lib/api.mjs";
import { getSentiment } from "../../../lib/market.mjs";

export function GET() {
  return jsonResponse({ ...getSentiment(), dataMode: "demo", live: false });
}
