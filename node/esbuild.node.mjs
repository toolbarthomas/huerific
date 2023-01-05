import { existsSync, writeFileSync, unlinkSync } from 'fs'
import esbuild from 'esbuild'

import { entryPoints, keepNames, outfile } from './esbuild.config.mjs'

/*
 * Creates a new production bundle with
 */
;(async () => {
  const result = await esbuild.build({
    bundle: true,
    entryPoints,
    keepNames,
    platform: 'node',
    metafile: false,
    minify: false,
    outfile,
    plugins: []
  })

  console.info(`Esbuild Bundle created: ${outfile}`)
})()
