import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

test("npm run build produces a self-contained site/app/ directory", () => {
  rmSync("site/app", { recursive: true, force: true });
  execFileSync("node", ["scripts/build.js"], { stdio: "pipe" });

  assert.ok(existsSync("site/app/index.html"), "site/app/index.html should exist");
  assert.ok(existsSync("site/app/styles.css"), "site/app/styles.css should exist");
  assert.ok(existsSync("site/app/main.js"), "site/app/main.js should exist");
  assert.ok(existsSync("site/app/RDKit_minimal.js"), "site/app/RDKit_minimal.js should exist");
  assert.ok(existsSync("site/app/RDKit_minimal.wasm"), "site/app/RDKit_minimal.wasm should exist");

  const html = readFileSync("site/app/index.html", "utf8");
  assert.match(html, /href="styles\.css"/, "index.html should reference styles.css with a relative path");
  assert.match(html, /src="main\.js"/, "index.html should reference main.js with a relative path");
  assert.match(
    html,
    /src="\.\/RDKit_minimal\.js"/,
    "index.html should reference RDKit_minimal.js with a relative path"
  );

  rmSync("site/app", { recursive: true, force: true });
});
