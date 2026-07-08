import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
      },
    },
  },
  {
    files: ["test/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
];
