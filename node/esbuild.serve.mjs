import esbuild from 'esbuild'

import { entryPoints, outfile } from './esbuild.config.mjs'

/**
 * Starts the basic development server with Esbuild.
 */
;(async () => {
  await esbuild
    .serve(
      {
        host: 'localhost',
        port: 8000,
        servedir: 'dist'
      },
      {
        bundle: true,
        entryPoints,
        outfile,
        plugins: []
      }
    )
    .then((server) => {
      console.log(`Esbuild server started: http://${server.host}:${server.port}`)
    })
})()
