import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const codeExtensions = new Set([".ts", ".tsx", ".css", ".mjs", ".html"]);
const ignored = new Set([".git", ".next", ".wrangler", "dist", "node_modules"]);
const oversized = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry)) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!codeExtensions.has(extname(path))) continue;
    const lines = readFileSync(path, "utf8").split(/\r?\n/).length;
    if (lines >= 500) oversized.push(`${relative(root, path)}: ${lines}줄`);
  }
}

walk(root);
if (oversized.length) {
  console.error(`500줄 이상인 코드 파일이 있습니다:\n${oversized.join("\n")}`);
  process.exit(1);
}
console.log("모든 코드 파일이 500줄 미만입니다.");
