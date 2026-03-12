// eslint.config.mjs
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";
import { dirname } from "path";
import { fileURLToPath } from "url";
import globals from "globals";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
    // 忽略编译产物
    {
        ignores: ["main.js", "dist/**", "node_modules/**"],
    },

    // Obsidian 官方推荐规则
    ...obsidianmd.configs.recommended,

    // 仅对 TS 文件启用 typed linting
    {
        files: ["**/*.ts", "**/*.js", "**/*.mjs"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                projectService: true,               // ← 关键：启用类型信息
                tsconfigRootDir: __dirname,         // ← 指向项目根目录
            },
        },
        rules: {
            "obsidianmd/sample-names": "off",
        },
    },

    // JS 文件不需要类型信息
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        globals: {
            ...globals.browser,
            ...globals.node,
        },
    },
]);
