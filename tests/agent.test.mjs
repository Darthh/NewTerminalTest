import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createAgentServer } from "../services/agent/server.mjs";

test("local agent scaffold satisfies health and JSON invocation contracts", async () => {
  const server = createAgentServer().listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(`${origin}/ping`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "Healthy" });
    const invocation = await fetch(`${origin}/invocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "NVDA quote" }),
    });
    assert.equal(invocation.status, 200);
    const result = await invocation.json();
    assert.equal(result.mode, "local-contract-scaffold");
    assert.equal(result.model, "local-research");
    assert.deepEqual(result.symbols, ["NVDA"]);
    const invalid = await fetch(`${origin}/invocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hi", model: "hosted" }),
    });
    assert.equal(invalid.status, 400);
    assert.match((await invalid.json()).error, /Only Local research/);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
