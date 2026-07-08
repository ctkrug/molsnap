import { build, context } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

// The deployed site is `site/`: a static landing page (site/index.html, committed)
// plus the built app under site/app/ (produced here, gitignored). Hosting copies the
// whole `site/` tree to apps.charliekrug.com/molsnap/, so the landing page's "open the
// app" link resolves to /molsnap/app/ with relative asset paths intact.
const siteDir = "site";
const appDir = `${siteDir}/app`;
const serve = process.argv.includes("--serve");

rmSync(appDir, { recursive: true, force: true });
mkdirSync(appDir, { recursive: true });

cpSync("src/index.html", `${appDir}/index.html`);
cpSync("src/styles.css", `${appDir}/styles.css`);
cpSync("node_modules/@rdkit/rdkit/dist/RDKit_minimal.js", `${appDir}/RDKit_minimal.js`);
cpSync("node_modules/@rdkit/rdkit/dist/RDKit_minimal.wasm", `${appDir}/RDKit_minimal.wasm`);

const buildOptions = {
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: `${appDir}/main.js`,
  format: "esm",
  target: "es2020",
  sourcemap: true,
  logLevel: "info",
};

if (serve) {
  const ctx = await context(buildOptions);
  await ctx.watch();
  // Serve the whole site tree so dev mirrors production: landing at /, app at /app/.
  const { hosts, port } = await ctx.serve({ servedir: siteDir, port: 8080 });
  console.log(`Serving ${siteDir}/ at http://${hosts[0]}:${port}/ (app at /app/)`);
} else {
  await build(buildOptions);
}
