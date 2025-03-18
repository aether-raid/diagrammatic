import { spawn } from 'child_process';
import * as vscode from "vscode";

const extension = vscode.extensions.getExtension('diagrammatic.diagrammatic')!;
const linterPath = `${extension.extensionPath}\\config\\linters\\cpplint.exe`

export const lintFileCpp = (filePath:string, configFilePath:string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try{
            let output = "";
            const pythonProcess = spawn(linterPath, [filePath])
            pythonProcess.stderr.on("data", (data) => {
                output += data.toString()
            });
            pythonProcess.stderr.on("end", () => {
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
