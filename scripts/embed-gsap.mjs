#!/usr/bin/env node
// 把 skill 自带的 GSAP 发行文件整段内联进成品 HTML。
// 用法：node scripts/embed-gsap.mjs /path/to/report.html [更多文件...]
// 已有 GSAP 时跳过；否则插到第一个 <script> 之前，保证库先于业务脚本执行。

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const libPath = resolve(skillRoot, "assets/html/vendor/gsap-3.13.0.min.js");
const files = process.argv.slice(2);
const placeholder = "<!-- GSAP_PLACEHOLDER -->";
const version = "GSAP 3.13.0";

// 只认「script 标签里紧跟许可头」的整段库，正文里出现版本号不算已内联。
const inlinedPattern = /<script[^>]*>\s*\/\*![\s\S]*?GSAP 3\.13\.0[\s\S]*?<\/script>/;
const callPattern = /gsap\.(timeline|from|fromTo|to|set|matchMedia|defaults)\s*\(/;
const externalScriptPattern = /<script[^>]+src\s*=/i;

if (files.length === 0) {
  console.error("用法: node scripts/embed-gsap.mjs <report.html> [更多文件...]");
  process.exit(1);
}

if (!existsSync(libPath)) {
  console.error(`缺少库文件：${libPath}`);
  process.exit(1);
}

const lib = readFileSync(libPath, "utf8");
if (!lib.includes(version) || !lib.includes("@license")) {
  console.error("库文件不完整或缺少许可声明，请重新放置 GSAP 发行文件。");
  process.exit(1);
}

const block = `<script>\n${lib}\n</script>`;
let failed = false;

function withoutLibrary(html) {
  return html.replace(inlinedPattern, "");
}

for (const file of files) {
  const path = resolve(file);
  if (!existsSync(path)) {
    console.error(`失败  ${file}  找不到文件`);
    failed = true;
    continue;
  }

  let html = readFileSync(path, "utf8");

  if (inlinedPattern.test(html)) {
    console.log(`已内联  ${file}`);
  } else {
    if (externalScriptPattern.test(html)) {
      console.error(`失败  ${file}  存在外部 <script src>，请改成内联后再运行`);
      failed = true;
      continue;
    }

    if (html.includes(placeholder)) {
      html = html.replace(placeholder, block);
    } else {
      const at = html.indexOf("<script");
      if (at >= 0) {
        html = html.slice(0, at) + block + "\n" + html.slice(at);
      } else if (html.includes("</body>")) {
        html = html.replace("</body>", block + "\n</body>");
      } else {
        console.error(`失败  ${file}  找不到 <script> 或 </body>，无法定位插入位置`);
        failed = true;
        continue;
      }
    }
    writeFileSync(path, html, "utf8");
    console.log(`已嵌入  ${file}`);
  }

  const result = readFileSync(path, "utf8");
  if (!inlinedPattern.test(result)) {
    console.error(`失败  ${file}  写入后仍未检出整段 ${version} 库`);
    failed = true;
    continue;
  }
  if (externalScriptPattern.test(result)) {
    console.error(`失败  ${file}  仍有外部脚本引用`);
    failed = true;
    continue;
  }
  if (!callPattern.test(withoutLibrary(result))) {
    console.error(`失败  ${file}  已内联库但没有任何 GSAP 动效调用，请按动效规则给每页写时间线`);
    failed = true;
    continue;
  }
}

process.exit(failed ? 1 : 0);
