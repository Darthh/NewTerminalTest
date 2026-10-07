import { jsonResponse } from "../../../lib/api.mjs";
function unavailable() {
  return jsonResponse(
    {
      error:
        "Cloud document extraction and storage are unavailable. Attach a readable TXT or Markdown file directly in chat.",
      code: "RESEARCH_SERVICE_UNAVAILABLE",
      limits: {
        uploadBytes: 4194304,
        extractedTextBytes: 184320,
        attachments: 8,
      },
    },
    503,
  );
}
export const GET = unavailable;
export const POST = unavailable;
