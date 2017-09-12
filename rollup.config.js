import coffeeScript from 'rollup-plugin-coffee-script';
import commonjs from 'rollup-plugin-commonjs';
import executable from 'rollup-plugin-executable';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export default {
  banner: '#!/usr/bin/env node',
  external: [
    'events', 'fs', 'http', 'https', 'net', 'path', 'tls', 'tty', 'url', 'util'
  ],
  input: 'src/index.coffee',
  output: {
    file: 'bin/releaseman',
    format: 'cjs'
  },
  plugins: [
    json(),
    coffeeScript(),
    nodeResolve({
      extensions: [ '.js', '.json', '.coffee' ]
    }),
    commonjs({
      extensions: [ '.js', '.json', '.coffee' ]
    }),
    uglify({}, minify),
    executable()
  ]
};
