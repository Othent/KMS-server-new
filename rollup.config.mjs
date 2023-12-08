import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const external = [
  "@google-cloud/kms",
  "arweave-mnemonic-keys",
  "axios",
  "base64-js",
  "cors",
  "express",
  "jsonwebtoken",
  "jwk-to-pem",
  "multer",
  "pem-jwk",
  "body-parser",
  "dotenv",
  "fast-crc32c",
  "crypto",
  "mongodb",
];

const plugins = [
  commonjs(),
  typescript({
    declaration: false,
  }),
  terser(),
];

const inputs = {
  index: "src/index.ts",
};

export default {
  input: inputs,
  output: [
    {
      dir: "dist",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].mjs",
    },
  ],
  plugins,
  external,
};
