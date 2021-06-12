import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";
import * as fs from "fs";
import path from "path";

const libFolderPath = path.join(__dirname, "./lib");

// Create lib folder
if (!fs.existsSync(libFolderPath)) {
  fs.mkdirSync(libFolderPath);
}

// move index.d.ts to /lib
fs.createReadStream(path.join(__dirname, "src/index.d.ts")).pipe(
  fs.createWriteStream(path.join(__dirname, "lib/index.d.ts"))
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
