#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const here = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(here, "..");
const args = process.argv.slice(2);
const noSandbox = args.includes("--no-sandbox");
const targets = args.filter((arg) => !arg.startsWith("--"));

if (targets.length === 0) {
  console.error("用法：node scripts/check-deck.mjs <HTML 文件> [更多文件] [--no-sandbox]");
  process.exit(1);
}

const source = readFileSync(resolve(skillDir, "scripts/check-pagination.js"), "utf8");
const check = new Function(`return (${source});`)();

let browser;
try {
  browser = await chromium.launch({
    channel: "chrome",
    args: noSandbox ? ["--no-sandbox"] : [],
  });
} catch (error) {
  console.error(`无法启动 Chrome：${error.message}`);
  console.error("请确认本机已安装 Google Chrome，并在 skill 目录运行过 npm install 安装 playwright-core。");
  console.error("Chrome 沙箱在部分环境下无法初始化，可追加 --no-sandbox 再试。");
  process.exit(1);
}

let failed = 0;

try {
  for (const target of targets) {
    const file = resolve(process.cwd(), target);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(pathToFileURL(file).href);
    try {
      const result = await check(page);
      console.log(`通过  ${target}  ${result}`);
    } catch (error) {
      failed += 1;
      console.error(`失败  ${target}  ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (failed > 0) {
  console.error(`${failed} 个文件未通过验收。`);
  process.exit(1);
}
