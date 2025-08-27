import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json" with { type: "json" };
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from 'node:url';

// ref https://rollupjs.org/command-line-interface/#getting-the-current-directory
const currentDir = fileURLToPath(new URL('.', import.meta.url))
const libFolderPath = path.join(currentDir, "./lib");

// Create lib folder
if (!fs.existsSync(libFolderPath)) {
  fs.mkdirSync(libFolderPath);
}

// move index.d.ts to /lib
fs.createReadStream(path.join(currentDir, "src/index.d.ts")).pipe(
  fs.createWriteStream(path.join(currentDir, "lib/index.d.ts"))
);

export default {
  input: "src/index.js",
  output: [
    {
      name: "cryptoformat",
      file: pkg.browser,
      format: "umd",
    },
    {
      name: "cryptoformat",
      file: pkg.main,
      format: "cjs",
    },
    {
      name: "cryptoformat",
      file: pkg.module,
      format: "es",
    },
  ],
  plugins: [
    resolve(), // so Rollup can find `dependencies`
    commonjs(), // so Rollup can convert `dependencies` to an ES module
  ],
};
