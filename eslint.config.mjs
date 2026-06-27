import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import sonarjs from "eslint-plugin-sonarjs";
import noTypeAssertion from "eslint-plugin-no-type-assertion";
import eslintConfigPrettier from "eslint-config-prettier";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,ts,mts,tsx,vue}"],
  },
  {
    name: "app/files-to-ignore",
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  pluginVue.configs["flat/strongly-recommended"],
  vueTsConfigs.recommended,
  {
    plugins: {
      sonarjs,
      "no-type-assertion": noTypeAssertion,
    },
    rules: {
      "vue/no-unused-vars": "error",
      "vue/no-reserved-component-names": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "no-unreachable": "error",
      "vue/multi-word-component-names": "off",
      "sonarjs/cognitive-complexity": "error",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/elseif-without-else": "error",
      "sonarjs/max-switch-cases": "error",
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-empty-collection": "error",
      "sonarjs/no-extra-arguments": "error",
      "sonarjs/no-gratuitous-expressions": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-ignored-return": "error",
      "sonarjs/no-inverted-boolean-check": "error",
      "sonarjs/no-nested-switch": "error",
      "sonarjs/no-nested-template-literals": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-same-line-conditional": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/no-useless-catch": "error",
      "sonarjs/non-existent-operator": "error",
      "sonarjs/prefer-object-literal": "error",
      "sonarjs/prefer-single-boolean-return": "error",
      "sonarjs/prefer-while": "error",
      "no-console": isProduction ? "warn" : "off",
      "no-debugger": isProduction ? "warn" : "off",
    },
  },
  eslintConfigPrettier,
);
