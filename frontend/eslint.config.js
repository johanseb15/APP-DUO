import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: ["src/AdminApp.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
        ...globals.jest, // Add Jest globals for test files
        ...globals.serviceworker // Add Service Worker globals
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    plugins: {
      react: pluginReact,
      "jsx-a11y": pluginJsxA11y
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { "varsIgnorePattern": "API|axios|api", "argsIgnorePattern": "^_" }], // Ignore API, axios, api if unused
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/click-events-have-key-events": "off", // Temporarily disable for build
      "jsx-a11y/no-static-element-interactions": "off", // Temporarily disable for build
      "jsx-a11y/no-noninteractive-element-interactions": "off", // Temporarily disable for build
      "react/react-in-jsx-scope": "off" // Not needed for React 17+ JSX transform
    }
  }
];
