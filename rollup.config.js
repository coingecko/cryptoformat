import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import pkg from "./package.json";

export default {
  input: "src/index.js",
  output: [
    {
      name: "cryptoformat",
      file: pkg.browser,
      format: "umd"
    },
    {
      name: "cryptoformat",
      file: pkg.main,
      format: "cjs"
    },
    {
      name: "cryptoformat",
      file: pkg.module,
      format: "es"
    }
  ],
  plugins: [
    resolve(), // so Rollup can find `dependencies`
    commonjs(), // so Rollup can convert `dependencies` to an ES module
    copy({
      "src/index.d.ts": "lib/index.d.ts",
      verbose: true
    })
  ]
};
