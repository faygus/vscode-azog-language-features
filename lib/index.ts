import * as vscode from 'vscode';

export function foo() {
	vscode.workspace.onDidChangeTextDocument(event => {
		vscode.window.showInformationMessage('text changed !');
	});
}
