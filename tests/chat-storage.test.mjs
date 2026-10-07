import test from "node:test";
import assert from "node:assert/strict";
import {
  readChats,
  saveChat,
  writeChats,
  CHAT_KEY,
  normalizeChat,
} from "../lib/chat-storage.mjs";
test("conversation archive preserves a failed question and other conversations while editing or deleting", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  globalThis.window = { dispatchEvent: () => {} };
  const question = {
    id: "a",
    title: "Question",
    messages: [
      { role: "user", content: "My original question" },
      { role: "assistant", content: "Failed", status: "failed" },
    ],
  };
  assert.equal(saveChat(question), true);
  saveChat({ id: "b", title: "Other research", messages: [] });
  saveChat({ ...question, title: "Renamed" });
  assert.equal(readChats().length, 2);
  assert.equal(readChats()[0].messages[0].content, "My original question");
  assert.equal(readChats()[0].title, "Renamed");
  writeChats(readChats().filter((c) => c.id !== "a"));
  assert.deepEqual(
    readChats().map((c) => c.id),
    ["b"],
  );
  values.set(CHAT_KEY, "broken JSON");
  assert.deepEqual(readChats(), []);
});
test("storage failure is reported instead of claiming persistence", () => {
  globalThis.localStorage = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("quota");
    },
  };
  globalThis.window = { dispatchEvent: () => {} };
  assert.deepEqual(readChats(), []);
  assert.equal(saveChat({ id: "x", messages: [] }), false);
});

test("corrupt archived messages and unsafe source links are normalized before rendering", () => {
  const safe = normalizeChat({
    id: "safe-id",
    title: null,
    updatedAt: "not a date",
    messages: [
      null,
      { role: "system", content: "untrusted instructions" },
      { role: "user", content: "Original question" },
      {
        role: "assistant",
        content: "Answer",
        status: "bogus",
        sources: [
          { title: "Bad", url: "javascript:alert(1)" },
          { title: "Protocol-relative", url: "//evil.example" },
          { title: "Demo", url: "/stock/NVDA" },
        ],
        stocks: ["NVDA", "NVDA", "../secret"],
        attachments: [null, "notes.txt"],
      },
    ],
  });
  assert.equal(safe.title, "Original question");
  assert.equal(safe.messages.length, 2);
  assert.ok(
    safe.messages.every(
      (message) =>
        typeof message.id === "string" && typeof message.content === "string",
    ),
  );
  assert.equal(safe.messages[1].status, undefined);
  assert.deepEqual(safe.messages[1].sources, [
    { title: "Demo", url: "/stock/NVDA" },
  ]);
  assert.deepEqual(safe.messages[1].stocks, ["NVDA"]);
  assert.deepEqual(safe.messages[1].attachments, ["notes.txt"]);
  assert.ok(Number.isFinite(Date.parse(safe.updatedAt)));
  assert.equal(normalizeChat({ id: "../invalid", messages: [] }), null);
});

test("archive restores valid records while deduplicating IDs and omitting malformed records", () => {
  globalThis.localStorage = {
    getItem: () =>
      JSON.stringify([
        null,
        { id: "a", messages: [null] },
        { id: "a", messages: [] },
        { id: 123, messages: [] },
      ]),
  };
  const chats = readChats();
  assert.equal(chats.length, 1);
  assert.equal(chats[0].title, "Untitled research");
  assert.deepEqual(chats[0].messages, []);
});
