import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
   languageOptions: {
     parser: tsparser,
     parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },  globals: {
    PerformanceObserver: "readonly",
    PerformanceResourceTiming: "readonly",
    PerformanceNavigationTiming: "readonly",
    PerformanceEntry: "readonly",
    Worker: "readonly",
    self: "readonly",
    MessageEvent: "readonly",
    URL: "readonly",
    Document: "readonly",
    Window: "readonly",
    HTMLElement: "readonly",
    EventListener: "readonly",
  },   },
    plugins: { tseslint, react: reactPlugin, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },


    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
    },
    settings: { react: { version: "detect" } },
  },
];

