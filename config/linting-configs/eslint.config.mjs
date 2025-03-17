import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";
import pluginSecurity from 'eslint-plugin-security'; 

export default [{
    files: ["**/*.ts"],
}, {
    plugins: {
        // eslint,
        "@typescript-eslint": typescriptEslint,
        sonarjs,
        "security":pluginSecurity,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },


    rules: {
        // ...tseslint.config(
        //     eslint.configs.recommended,
        //     ...tseslint.configs.recommended,
        // ),
        "@typescript-eslint/naming-convention": ["warn", {
            selector: "import",
            format: ["camelCase", "PascalCase"],
        }],
        "curly": "warn",
        "eqeqeq": "warn",
        "no-throw-literal": "warn",
        ...sonarjs.configs.recommended.rules,
        ...pluginSecurity.configs.recommended.rules
    },
}];