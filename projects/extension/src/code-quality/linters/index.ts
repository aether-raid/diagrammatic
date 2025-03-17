import type { CppLintResult } from './definitions';
import { ESLint } from 'eslint';
import { processCpplintOutput } from '../linting/helpers';
import { lintFileCpp } from './cpp';
import { lintFileES } from './ts';


export const lintFile = (linter: string, filePath: string, configFilePath:string): Promise<ESLint.LintResult[] | CppLintResult[]> | []=>  {
    switch (linter) {
        case 'eslint':
        case 'tslint':
            return lintFileES(filePath, configFilePath);
        case 'cpplint':
            return lintFileCpp(filePath, configFilePath).then((output) => processCpplintOutput(output));
        default:
            break;
    }
    return [];
}
