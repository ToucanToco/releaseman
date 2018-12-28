import commonjs from 'rollup-plugin-commonjs'
import executable from 'rollup-plugin-executable'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
  external: [
    'assert', 'buffer', 'child_process', 'events', 'fs', 'http', 'https',
    'path', 'spawn-sync', 'stream', 'string_decoder', 'url', 'util', 'zlib'
  ],
  input: 'src/index.js',
  output: {
    banner: '#!/usr/bin/env node',
    file: 'bin/releaseman',
    format: 'cjs'
  },
  plugins: [
    json(),
    nodeResolve({
      extensions: ['.js', '.json']
    }),
    commonjs({
      extensions: ['.js', '.json']
    }),
    uglify({}, minify),
    executable()
  ]
}
