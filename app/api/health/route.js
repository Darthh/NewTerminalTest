import { jsonResponse } from "../../../lib/api.mjs";

export function GET() {
  return jsonResponse({
    status: "ok",
    application: "Luna Terminal",
    mode: "local-preview",
    marketData: "illustrative",
    model: "local-research",
    webSearch: false,
    authentication: false,
    accountPersistence: false,
  });
}
