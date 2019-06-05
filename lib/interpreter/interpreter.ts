import * as vscode from 'vscode';
import { EditorEventListener } from '../utils/document-listener';
import { xmlToAzog } from './xml-to-azog';

/**
 * Interprets the xml file to extract a json Data at each workspace change
 */
export class XmlInterpreter extends EditorEventListener {

	constructor() {
		super();
		this.listen(vscode.workspace.onDidChangeTextDocument, (data) => {
			this.interpret(data.document);
		});
	}

	private async interpret(document: vscode.TextDocument): Promise<void> {
		const xml = document.getText();
		const azogApp = await xmlToAzog(xml);
		if (!azogApp) return;
		console.log('azogApp', JSON.stringify(azogApp));
	}
}
