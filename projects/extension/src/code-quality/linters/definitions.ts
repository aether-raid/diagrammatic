import type { Linter } from "eslint"

export enum SupportedLanguages {
    js = "js",
    ts = "ts",
    py = "py",
    java = "java",
    cpp = "cpp"
}

export const requiredPackages = {
    js:  ["eslint"],
    ts:  ["eslint"],
    py:  ["flake8"],
    java:  ["checkstyle"],
    cpp: ["cpplint"]
}


export const linters : {[key in keyof typeof SupportedLanguages]: string} = {
    "js": "eslint",
    "ts": "eslint",
    "py": "flake8",
    "java": "Checkstyle",
    "cpp": "cpplint"
};
export const lintingCommands : { [key in keyof typeof SupportedLanguages]: string } = {
    "js": "eslint --format compact",
    "ts": "eslint --format compact",
    "py": "flake8 --format=default",
    "java": "checkstyle -c /google_checks.xml",
    "cpp": "cpplint"
};



export type LintResult = {
    filePath: string;
    messages: Linter.LintMessage[];
    suppressedMessages: any[];
    errorCount: number;
    warningCount: number;
    fatalErrorCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    usedDeprecatedRules: any[];
  };

