await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "./build",
  format: "esm",
  target: "browser",
});
