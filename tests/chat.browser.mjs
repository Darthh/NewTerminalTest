import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.LUNA_TEST_URL || "http://127.0.0.1:3000";
await fs.mkdir("artifacts/chat-qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const saved = () =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("luna.chats.v1") || "[]"),
  );
const openNew = async () => {
  await page
    .locator(".primary-nav")
    .getByRole("link", { name: "New Chat" })
    .click();
  await expect(page).toHaveURL(base + "/dashboard/chat");
  await expect(page.locator(".chat-greeting")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Luna" })).toHaveValue(
    "",
  );
};
try {
  await page.goto(base + "/dashboard/chat", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "See the market in a new light." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Appearance settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Midnight", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.theme),
    "Midnight",
  );
  await page
    .getByRole("button", { name: "Appearance settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Luna", exact: true }).click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("textbox", { name: "Search stocks and companies" })
    .fill("AMD");
  await page
    .getByRole("textbox", { name: "Search stocks and companies" })
    .press("Enter");
  await expect(page.locator("h1")).toContainText("Advanced Micro");
  await page.goto(base + "/dashboard/chat", { waitUntil: "networkidle" });
  await page
    .getByRole("textbox", { name: "Message Luna" })
    .fill("Compare NVDA and SPY over the last year.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop response" }),
  ).toBeHidden();
  await expect(page.locator(".inline-quote-card")).toHaveCount(2);
  let archive = await saved();
  assert.equal(
    archive[0].messages[0].content,
    "Compare NVDA and SPY over the last year.",
  );
  assert.equal(archive[0].messages.at(-1).status, "complete");
  const originalId = archive[0].id;
  assert.ok(page.url().endsWith(originalId));
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".inline-quote-card")).toHaveCount(2);
  await openNew();
  assert.ok((await saved()).some((c) => c.id === originalId));
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Simulated provider unavailable" }),
    }),
  );
  await page
    .getByRole("textbox", { name: "Message Luna" })
    .fill("A question preserved despite failure.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".inline-error")).toContainText(
    "Simulated provider unavailable",
  );
  archive = await saved();
  assert.equal(
    archive[0].messages[0].content,
    "A question preserved despite failure.",
  );
  assert.equal(archive[0].messages.at(-1).status, "failed");
  await page.unroute("**/api/chat");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop response" }),
  ).toBeHidden();
  await expect(page.locator(".inline-error")).toHaveCount(0);
  assert.equal((await saved())[0].messages.at(-1).status, "complete");
  await openNew();
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: '{"type":"token","text":"Partial evidence only."}\n',
    }),
  );
  await page
    .getByRole("textbox", { name: "Message Luna" })
    .fill("Truncated response test.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".inline-error")).toContainText(
    "ended before completion",
  );
  assert.equal((await saved())[0].messages.at(-1).status, "interrupted");
  await page.unroute("**/api/chat");
  await openNew();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "client-notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "Research note: Diversification reduces single-company concentration. These fictional notes are for testing.",
      ),
    });
  await page
    .getByRole("textbox", { name: "Message Luna" })
    .fill("Summarize the diversification evidence in my attached document.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".chat-message.assistant")).toContainText(
    "client-notes.txt, chunk 1",
  );
  await expect(
    page.getByRole("button", { name: "Stop response" }),
  ).toBeHidden();
  await page.screenshot({
    path: "artifacts/chat-qa/document-research.png",
    fullPage: true,
  });
  await openNew();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "long-notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "A portfolio review records diversification and allocation assumptions. ".repeat(
          160,
        ),
      ),
    });
  await page
    .getByRole("textbox", { name: "Message Luna" })
    .fill("Retrieve all relevant evidence in the attached portfolio review.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByRole("button", { name: "Stop response" }).click();
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeVisible();
  assert.equal((await saved())[0].messages.at(-1).status, "interrupted");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  await page.screenshot({
    path: "artifacts/chat-qa/mobile-conversation.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "View all history" }).click();
  await page
    .getByRole("textbox", { name: "Search conversations" })
    .fill("Compare NVDA");
  await expect(
    page.getByRole("button", {
      name: "Delete Compare NVDA and SPY over the last year.",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Delete Compare NVDA and SPY over the last year.",
    })
    .click();
  assert.equal(
    (await saved()).some((c) => c.id === originalId),
    false,
  );
  await page.keyboard.press("Escape");
  assert.deepEqual(errors, []);
  await fs.writeFile(
    "artifacts/chat-qa/results.json",
    JSON.stringify(
      {
        verified: [
          "theme persistence",
          "AMD search",
          "streamed stock cards",
          "route restoration",
          "new chat archive",
          "failed question preservation",
          "retry",
          "truncated stream status",
          "TXT evidence",
          "cancellation",
          "390px conversation",
          "history deletion",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      themePersistence: true,
      AMDSearch: true,
      streamingAndCards: true,
      reload: true,
      archive: true,
      failedQuestionSaved: true,
      retry: true,
      truncatedStream: true,
      textEvidence: true,
      cancel: true,
      mobileOverflow: false,
      historyDelete: true,
      errors,
    }),
  );
} catch (error) {
  await page.screenshot({
    path: "artifacts/chat-qa/failure.png",
    fullPage: true,
  });
  console.log(
    JSON.stringify({
      url: page.url(),
      body: await page.locator("#main-content").innerText(),
      archive: await saved(),
      errors,
    }),
  );
  throw error;
} finally {
  await browser.close();
}
