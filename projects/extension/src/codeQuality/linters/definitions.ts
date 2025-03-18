export enum SupportedLanguages {
    js = "js",
    ts = "ts",
    jsx = "jsx",
    tsx = "tsx",
    cpp = "cpp",
    h = "cpp"
}
export const Linters : {[key in keyof typeof SupportedLanguages]: string} = {
    "js": "eslint",
    "ts": "eslint",
    "jsx": "eslint",
    "tsx": "eslint",
    "cpp": "cpplint",
    "h": "cpplint"
};
export type CppLintResult = {
    filePath: string,
    messages: CppLintMessage[]
}
export type CppLintMessage = {
    line: number,
    messageId: string,
    message: string,
    column: number,
    ruleId: string,
    severity: number,
    endLine?: number,
    endColumn?: number
}