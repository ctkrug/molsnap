import { build, context } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

const outdir = "dist";
const serve = process.argv.includes("--serve");

rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

cpSync("src/index.html", `${outdir}/index.html`);
cpSync("src/styles.css", `${outdir}/styles.css`);

const buildOptions = {
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: `${outdir}/main.js`,
  format: "esm",
  target: "es2020",
  sourcemap: true,
  logLevel: "info",
};

if (serve) {
  const ctx = await context(buildOptions);
  await ctx.watch();
  const { host, port } = await ctx.serve({ servedir: outdir, port: 8080 });
  console.log(`Serving ${outdir} at http://${host}:${port}`);
} else {
  await build(buildOptions);
}
