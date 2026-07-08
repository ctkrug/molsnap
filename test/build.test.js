import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

test("npm run build produces a self-contained dist/ directory", () => {
  rmSync("dist", { recursive: true, force: true });
  execFileSync("node", ["scripts/build.js"], { stdio: "pipe" });

  assert.ok(existsSync("dist/index.html"), "dist/index.html should exist");
  assert.ok(existsSync("dist/styles.css"), "dist/styles.css should exist");
  assert.ok(existsSync("dist/main.js"), "dist/main.js should exist");
  assert.ok(existsSync("dist/RDKit_minimal.js"), "dist/RDKit_minimal.js should exist");
  assert.ok(existsSync("dist/RDKit_minimal.wasm"), "dist/RDKit_minimal.wasm should exist");

  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /href="styles\.css"/, "index.html should reference styles.css with a relative path");
  assert.match(html, /src="main\.js"/, "index.html should reference main.js with a relative path");
  assert.match(
    html,
    /src="\.\/RDKit_minimal\.js"/,
    "index.html should reference RDKit_minimal.js with a relative path"
  );

  rmSync("dist", { recursive: true, force: true });
});
