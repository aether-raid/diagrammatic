import type { CppLintResult } from '../linters/definitions';
import { ESLint } from 'eslint';
import { processCpplintOutput } from '../linting/helpers';
import { lintFileCpp } from './cpp';
import { lintFileES } from './ts';


export const lintFile = (linter: string, filePath: string, cwd:string): Promise<ESLint.LintResult[] | CppLintResult[]> | []=>  {
    switch (linter) {
        case 'eslint':
        case 'tslint':
            return lintFileES(filePath, cwd);
        case 'cpplint':
            return lintFileCpp(filePath).then((output) => processCpplintOutput(output));
        default:
            break;
    }
    return [];
}
