const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const vue = require("eslint-plugin-vue");
const vueParser = require("vue-eslint-parser");
const sonarjs = require("eslint-plugin-sonarjs");
const noTypeAssertion = require("eslint-plugin-no-type-assertion");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.cjs"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/strongly-recommended"],
  {
    files: ["**/*.{ts,vue,js}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "no-type-assertion": noTypeAssertion,
      sonarjs,
    },
    rules: {
      // TypeScript handles undefined-name checks itself; ESLint's
      // no-undef trips on type-only references (generic params,
      // imported types) so the typescript-eslint maintainers
      // recommend disabling it for TS/Vue files.
      "no-undef": "off",
      "vue/no-unused-vars": "error",
      "vue/no-reserved-component-names": "error",
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "no-unreachable": "error",
      "sonarjs/cognitive-complexity": "error",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/elseif-without-else": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-nested-template-literals": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/prefer-single-boolean-return": "error",
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },
  prettierConfig,
];
