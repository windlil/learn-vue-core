import typescript from "@rollup/plugin-typescript";

export default {
  input: "./packages/index.ts",
  output: [
    {
      format: "cjs",
      file: "./dist/mini-vue.cjs.js",
    },
    {
      format: "es",
      file: "./dist/mini-vue.esm.js",
    },
  ],
  plugins: [typescript()],
};
