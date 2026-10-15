const fs = require("node:fs");
const path = require("node:path");

const root = path.join("node_modules", "@remotion", "renderer", "dist");

const shims = {
  "repro.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeInRepro = void 0;
const fs_1 = require("node:fs");
const path_1 = require("node:path");
const reproFile = (0, path_1.join)(process.cwd(), "remotion-repro.log");
const writeInRepro = (...args) => {
    try {
        (0, fs_1.appendFileSync)(reproFile, args.join(" ") + "\\n");
    }
    catch { }
};
exports.writeInRepro = writeInRepro;
`,
  "truthy.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truthy = void 0;
const truthy = (value) => value != null && value !== "";
exports.truthy = truthy;
`,
};

let created = 0;
for (const [file, content] of Object.entries(shims)) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, content, "utf8");
    created++;
  }
}
console.log(`[postinstall] remotion-renderer shims ensured (${created} created)`);
