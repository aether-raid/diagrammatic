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

const CPPWarning=1
const CPPError=2
export const cpplintSeverity : {[key:number]: number} = {
    1 : CPPWarning,
    2 : CPPWarning,
    3 : CPPWarning,
    4 : CPPWarning,
    5 : CPPError
}