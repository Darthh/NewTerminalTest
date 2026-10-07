import { spawn } from "node:child_process";
for (const file of [
  "tests/browser.smoke.mjs",
  "tests/chat.browser.mjs",
  "tests/market.browser.mjs",
  "tests/advisor.browser.mjs",
]) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", resolve);
  });
  if (code !== 0) process.exit(code || 1);
}
