import { spawn } from 'child_process';
import * as vscode from "vscode";
import * as path from "path";

const extension = vscode.extensions.getExtension('diagrammatic.diagrammatic')!;
// const linterPath = `${extension.extensionPath}\\config\\linters\\cpplint.exe`
const linterPath = path.join(extension.extensionPath, 'config', 'linters', 'cpplint.exe');

export const lintFileCpp = (filePath:string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try{
            let output = "";
            const process = spawn(linterPath, [filePath])
            process.stderr.on("data", (data) => {
                output += data.toString()
            });
            process.stderr.on("end", () => {
                resolve(output)
            })
        }catch(error){
            if (error instanceof Error){
                reject("Error running cpplint, error: " + error.message);
                vscode.window.showErrorMessage(`Error running cpplint: ${error.message}`);
            }
            console.error(error);
        }
    })
}
