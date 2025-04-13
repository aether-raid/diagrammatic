import { existsSync, readFileSync } from "fs";
import { retrieveExtensionConfig } from "../../helpers/common";
import { GLOBALS } from "../../globals";
import * as vscode from "vscode";
import * as path from 'path';

const extension = vscode.extensions.getExtension("diagrammatic.diagrammatic")!;
const lintFilterDefaultPath = path.join(extension.extensionPath, 'config', 'linting-configs', 'default-lint-filter.json');
const loadFilter = () : LintingConfigJson | undefined => {
    let lintFilterPath = retrieveExtensionConfig(GLOBALS.lintFilter.configName);
    if (!lintFilterPath || !existsSync(lintFilterPath)) {
        vscode.window.showInformationMessage(
            `No lint-filter file was found at '${lintFilterPath}'. Using default rules.`
        );
    }
    lintFilterPath = lintFilterDefaultPath;
    if (!lintFilterPath) {
        return;
    }
    return JSON.parse(readFileSync(lintFilterPath, "utf-8"));
}

const filter = loadFilter();
const emptyLintingConfig = {
    whitelist: {
        clean: [],
        vulnerability: [],
        extras: []
    },
    blacklist: []
}

const cppLintingConfig = filter ? filter.cpp : emptyLintingConfig
const tsLintingConfig = filter ? filter["ts/tsx/js/jsx"] : emptyLintingConfig

export const WHITELISTED_SOURCES: {[key: string]:string[]} = {
    clean: [ ...tsLintingConfig.whitelist.clean,  ...cppLintingConfig.whitelist.clean],
    vulnerability: [ ...tsLintingConfig.whitelist.vulnerability, ...cppLintingConfig.whitelist.vulnerability],
    extras: [ ...tsLintingConfig.whitelist.extras, ...cppLintingConfig.whitelist.extras]
    
};
export const BLACKLISTED_SOURCES: string[] = [
    ...tsLintingConfig.blacklist,
    ...cppLintingConfig.blacklist
];

export type Sources = typeof WHITELISTED_SOURCES | typeof BLACKLISTED_SOURCES;
export type LintingConfig = {
    whitelist: {
        clean: string[];
        vulnerability: string[];
        extras: never[];
    };
    blacklist: string[];
}
export type LintingConfigJson = {"cpp": LintingConfig, "ts/tsx/js/jsx": LintingConfig}