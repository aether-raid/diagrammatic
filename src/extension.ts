// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import handleShowMVCDiagram from './showMVCDiagram';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	const showMVCDiagram = vscode.commands.registerCommand('diagrammatic.showMVCDiagram', () => {
		currentPanel = handleShowMVCDiagram(context, currentPanel);
	});
	context.subscriptions.push(showMVCDiagram);
}

// This method is called when your extension is deactivated
export function deactivate() {}
