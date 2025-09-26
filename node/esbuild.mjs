import esbuild from "esbuild";

import { parse } from "@toolbarthomas/argumentje";
(async () => {
  const argv = parse();

  const watch = argv.watch || argv.w;

  const options = {
    bundle: true,
    entryPoints: ["src/index.ts"],
    format: argv.format || "esm",
    keepNames: true,
    external: ["@toolbarthomas/argumentje"],
    minify: argv.m || argv.minify || false,
    outdir: "dist",
    platform: argv.platform || "node",
  };

  if (watch) {
    esbuild.context(options).then((context) => {
      context
        .serve({
          servedir: "dist",
        })
        .then(({ hosts, port }) => {
          console.log(`Watching for changes from: ${hosts[0]}:${port}`);
        });
    });

    return;
  }

  esbuild.build(options).then(() => {
    console.log(`Library generated: ${options.outdir}`);
  });
})();
