import * as AmlParsing from "aml-parsing";
import * as vscode from 'vscode';
import { EditorEventListener } from "./utils/document-listener";
import { ParsingDataProvider, AmlParsingData } from "./parsing-data-provider";
import { jsonToAzog } from "./interpreter/json-to-azog";
import documentRules from "./language/language-specifications";

/**
 * Listen the vscode workspace event to operate parsing of files which change
 */
export class ParsingManager extends EditorEventListener {

	private _openedEditors: vscode.TextEditor[] = [];

	constructor() {
		super();
		vscode.window.visibleTextEditors.forEach(editor => {
			this._openedEditors.push(editor);
			this.triggerOperation(editor);
		});

		this.listen(vscode.workspace.onDidChangeTextDocument, (event) => {
			const editor = this._openedEditors.find(a => a.document === event.document);
			if (editor) {
				this.triggerOperation(editor);
			}
		}, 0);
		this.listen(vscode.window.onDidChangeVisibleTextEditors, (editors) => {
			const newEditors = editors.filter(e => this._openedEditors.indexOf(e) < 0);
			for (const editor of newEditors) {
				this.triggerOperation(editor);
			}
			this._openedEditors = editors;
		}, 0);
	}

	private async triggerOperation(editor: vscode.TextEditor) {
		const text = editor.document.getText();
		const parsingResult = AmlParsing.parseAmlCode(text);
		const json = parsingResult.interpretation;
		// console.log('json', json);
		let parsingData: AmlParsingData = {
			parsingResult: parsingResult,
			azogConversion: undefined
		};
		try {
			const azog = jsonToAzog(json, documentRules);
			parsingData.azogConversion = azog;
		} catch (err) {
			console.log((<Error>err).message);
		}
		ParsingDataProvider.parsingResults.set(editor.document, parsingData);
	}
}
