import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/renderer'
import react from '@vitejs/plugin-react'
import resolve from 'vite-plugin-resolve'
import pkg from '../../package.json'

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    react(),
    electron(),
    resolve({
      /**
       * Here you can resolve some CommonJs module.
       * Or some Node.js native modules they may not be built correctly by vite.
       * At the same time, these modules should be put in `dependencies`,
       * because they will not be built by vite, but will be packaged into `app.asar` by electron-builder
       */
      // ESM format code snippets
      // 'electron-store': 'export default require("electron-store");',
      /**
       * Node.js native module
       * Use lib2esm() to easy to convert ESM
       * Equivalent to
       *
       * ```js
       * sqlite3: () => `
       * const _M_ = require('sqlite3');
       * const _D_ = _M_.default || _M_;
       * export { _D_ as default }
       * `
       * ```
       */
      // sqlVte3: lib2esm('sqlite3', { format: 'cjs' }),
      // serialport: lib2esm(
      //   // CJS lib name
      //   'serialport',
      //   // export memebers
      //   ['SerialPort', 'SerialPortMock'],
      //   { format: 'cjs' }
      // ),
    }),
  ],
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    hmr: { overlay: false },
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
})
