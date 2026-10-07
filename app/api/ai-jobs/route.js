import { jsonResponse } from "../../../lib/api.mjs";
function unavailable() {
  return jsonResponse(
    {
      error:
        "Background research jobs are unavailable in this preview. No job has been queued.",
      code: "RESEARCH_SERVICE_UNAVAILABLE",
    },
    503,
  );
}
export const GET = unavailable;
export const POST = unavailable;
