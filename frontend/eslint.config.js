// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
// SỬA CÁCH IMPORT NÀY
import tseslintPlugin from "@typescript-eslint/eslint-plugin"; // Import plugin
import tseslintParser from "@typescript-eslint/parser";     // Import parser

export default [
  {
    // Cấu hình môi trường và parser chung
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        __dirname: true,
        module: true,
        process: true,
        '__DEV__': true,
        'jest': true,
        'expect': true,
      },
      // SỬ DỤNG PARSER ĐÃ IMPORT
      parser: tseslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    // Áp dụng các quy tắc cho các file cụ thể
    files: ["**/*.{js,jsx,ts,tsx}"], // Áp dụng cho các file này
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      // SỬ DỤNG PLUGIN ĐÃ IMPORT
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      // Các quy tắc khuyến nghị từ ESLint cơ bản
      ...pluginJs.configs.recommended.rules,
      // Các quy tắc khuyến nghị từ plugin TypeScript ESLint
      ...tseslintPlugin.configs.recommended.rules,
      // Các quy tắc khuyến nghị từ plugin React
      ...pluginReact.configs.recommended.rules,
      // Các quy tắc khuyến nghị từ plugin React Hooks
      ...pluginReactHooks.configs.recommended.rules,

      // Các quy tắc tùy chỉnh của bạn (ghi đè hoặc bổ sung)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      // '@typescript-eslint/no-explicit-any': 'off', // Bật nếu bạn muốn cho phép 'any'
      '@typescript-eslint/no-explicit-any': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
];