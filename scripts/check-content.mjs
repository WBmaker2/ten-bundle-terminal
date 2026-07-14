import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const scanRoots = ["app"];
const extensions = new Set([".ts", ".tsx"]);
const forbidden = [
  ["draggable", "드래그 기능"], ["pointermove", "포인터 이동 판정"],
  ["Math.random", "무작위 출제"], ["localStorage", "브라우저 저장소"],
  ["sessionStorage", "브라우저 저장소"], ["indexedDB", "브라우저 저장소"],
  ["fetch(", "외부 요청"], ["axios", "외부 요청"],
];
const findings = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) { walk(path); continue; }
    if (!extensions.has(extname(path))) continue;
    const source = readFileSync(path, "utf8");
    for (const [pattern, label] of forbidden) {
      if (source.includes(pattern)) findings.push(`${relative(root, path)}: ${label} (${pattern})`);
    }
  }
}

scanRoots.forEach((path) => walk(join(root, path)));
if (findings.length) {
  console.error(`MVP 제외 기능이 발견되었습니다:\n${findings.join("\n")}`);
  process.exit(1);
}
console.log("드래그·무작위·저장소·외부 요청이 앱 코드에 없습니다.");
