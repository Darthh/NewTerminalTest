import http from "node:http";
import { fileURLToPath } from "node:url";
import { validateChatRequest, researchAnswer } from "../../lib/chat-engine.mjs";

/** Local AgentCore HTTP contract scaffold. It has no hosted-model or AWS service access. */
export function createAgentServer() {
  return http.createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-store");
    if (request.method === "GET" && request.url === "/ping") {
      response.end(JSON.stringify({ status: "Healthy" }));
      return;
    }
    if (request.method !== "POST" || request.url !== "/invocations") {
      response.writeHead(404);
      response.end(JSON.stringify({ error: "Route not found." }));
      return;
    }
    let size = 0;
    const chunks = [];
    try {
      if (
        !/^application\/json(?:;|$)/i.test(
          request.headers["content-type"] || "",
        )
      ) {
        response.writeHead(415);
        response.end(JSON.stringify({ error: "Use application/json." }));
        return;
      }
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 4 * 1024 * 1024) {
          response.writeHead(413);
          response.end(JSON.stringify({ error: "Request exceeds 4 MB." }));
          return;
        }
        chunks.push(chunk);
      }
      const input = validateChatRequest(
        JSON.parse(Buffer.concat(chunks).toString("utf8")),
      );
      const answer = researchAnswer(input);
      response.end(
        JSON.stringify({
          text: answer.text,
          sources: answer.sources,
          symbols: answer.symbols,
          model: answer.model,
          mode: "local-contract-scaffold",
        }),
      );
    } catch (error) {
      response.writeHead(error.status || 400);
      response.end(
        JSON.stringify({
          error: error.status
            ? error.message
            : "Provide a valid research JSON request.",
        }),
      );
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createAgentServer().listen(8080, "0.0.0.0", () =>
    process.stdout.write("Luna contract scaffold listening on port 8080\n"),
  );
}
