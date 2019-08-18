import * as CodeParsing from "code-parsing";
import * as vscode from "vscode";
import { DecorationsList } from "./decoration-list";

export interface IDecorator {
	convertRange(range: CodeParsing.Range): vscode.Range;
	setDecorations(decorationType: vscode.TextEditorDecorationType, rangesOrOptions: vscode.DecorationOptions[]): void;
}

export class BaseDecorator implements IDecorator {
	constructor(private _decorationList: DecorationsList,
		private _editor: vscode.TextEditor) {
	}

	convertRange(range: CodeParsing.Range): vscode.Range {
		const start = this._editor.document.positionAt(range.start);
		const end = this._editor.document.positionAt(range.end);
		const res = new vscode.Range(start, end);
		return res;
	}

	setDecorations(decorationType: vscode.TextEditorDecorationType, rangesOrOptions: vscode.DecorationOptions[]): void {
		this._decorationList.addDecoration(decorationType, rangesOrOptions);
	}
}

export class EmbededDecorator implements IDecorator {
	constructor(private _parentEditor: IDecorator, private _offset: number) {

	}

	convertRange(range: CodeParsing.Range): vscode.Range {
		// range = range.add(this._offset);
		return this._parentEditor.convertRange(range);
	}

	setDecorations(decorationType: vscode.TextEditorDecorationType, rangesOrOptions: vscode.DecorationOptions[]): void {
		this._parentEditor.setDecorations(decorationType, rangesOrOptions);
	}
}
