const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsDir = path.join(root, "js");
let issues = 0;

if (fs.existsSync(jsDir)) {
  for (const f of fs.readdirSync(jsDir).filter((n) => n.endsWith(".js"))) {
    const src = fs.readFileSync(path.join(jsDir, f), "utf8");
    if (/\bdebugger\b/.test(src)) {
      console.warn("js/" + f, ": contains debugger");
      issues++;
    }
  }
}

if (issues) process.exit(1);
console.log("Lint passed.");
