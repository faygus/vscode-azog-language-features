import * as AmlParsing from "aml-parsing";
import * as vscode from 'vscode';
import { EditorEventListener } from "./utils/document-listener";
import { ParsingDataProvider } from "./parsing-data-provider";
import * as convert from "./interpreter";
import documentRules from "./language/language-specifications";
import { InterpretationProvider } from "./interpreter/intepretation-provider";
import { IViewModelInterfaceJSON, IViewJSON } from "azog-interface";

/**
 * Listen the vscode workspace event to operate parsing of files which change
 */
export class ParsingManager extends EditorEventListener {

	private _openedEditors: vscode.TextEditor[] = [];

	constructor() {
		super();
		vscode.window.visibleTextEditors.forEach(editor => {
			this._openedEditors.push(editor);
			this.parse(editor);
		});

		this.listen(vscode.workspace.onDidChangeTextDocument, (event) => {
			const editor = this._openedEditors.find(a => a.document === event.document);
			if (editor) {
				this.parse(editor);
			}
		}, 0);
		this.listen(vscode.window.onDidChangeVisibleTextEditors, (editors) => {
			const newEditors = editors.filter(e => this._openedEditors.indexOf(e) < 0);
			for (const editor of newEditors) {
				this.parse(editor);
			}
			this._openedEditors = editors;
		}, 0);
	}

	private async parse(editor: vscode.TextEditor) {
		const text = editor.document.getText();
		const parsingResult = AmlParsing.parse(text);
		const interpretation = parsingResult.interpretation;
		ParsingDataProvider.parsingResults.set(editor.document, parsingResult);
		let viewModelInterface: IViewModelInterfaceJSON | undefined = undefined;
		let template: IViewJSON | undefined = undefined;
		try {
			viewModelInterface = convert.convertViewModelInterface(interpretation.props);
		} catch (err) {

		}
		try {
			template = convert.convertTemplate(interpretation.template, documentRules);
		} catch (err) {

		}
		InterpretationProvider.data.set(editor.document.fileName, {
			viewModelInterface,
			template
		});
	}
}
