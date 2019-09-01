import { EditorEventListener } from "./utils/document-listener";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * Manage the list of view files in the workspace
 * If a new file is created, the file is parsed and the content
 * is saved in the registry
 */
export class FileList extends EditorEventListener {

	private _openedEditors: vscode.TextEditor[] = [];

	constructor() {
		super();
		/*this.listen(vscode.workspace.onDidChangeTextDocument, arg => {
			console.log('!!!!onDidChangeTextDocument', arg);
		});
		this.listen(vscode.workspace.onDidOpenTextDocument, arg => {
			console.log('!!!!onDidOpenTextDocument', arg);
		});
		this.listen(vscode.workspace.onDidChangeWorkspaceFolders, arg => {
			console.log('!!!!onDidChangeWorkspaceFolders', arg);
		});*/
		const folder = vscode.workspace.rootPath;
		console.log('vscode.workspace.rootPath', folder);
		if (!folder) return;
		fs.watch(folder, (eventType, filename) => {
			if (eventType !== 'rename') return;
			if (fs.existsSync(path.join(folder, filename))) { // created
				console.log(filename, 'created');
			} else { // deleted
				console.log(filename, 'deleted');
			}
		})
	}
}
