import * as AmlParsing from "aml-parsing";
import * as vscode from "vscode";
import { IFileDefinition } from "../../file-definition";
import { EditorEventListener } from "../../utils/document-listener";
import { DecorationsList } from "./decoration-list";
import { BaseDecorator } from "./i-decorator";
import { ViewFileHighlight } from "./view-file/highlight";

export class HighlightManager extends EditorEventListener {

	private _openedEditors: vscode.TextEditor[] = [];
	private _decorationsList = new DecorationsList();

	constructor(private _fileDefinition: IFileDefinition) {
		super();
		vscode.window.visibleTextEditors.forEach(editor => {
			this._openedEditors.push(editor);
			this.triggerHighlight(editor);
		});

		this.listen(vscode.workspace.onDidChangeTextDocument, (event) => {
			const editor = this._openedEditors.find(a => a.document === event.document);
			if (editor) {
				this.triggerHighlight(editor);
			}
		}, 0);
		this.listen(vscode.window.onDidChangeVisibleTextEditors, (editors) => {
			const newEditors = editors.filter(e => this._openedEditors.indexOf(e) < 0);
			for (const editor of newEditors) {
				this.triggerHighlight(editor);
			}
			this._openedEditors = editors;
		}, 0);
		// TODO listen events from parser manager and not from vscode
	}

	private async triggerHighlight(editor: vscode.TextEditor) {
		if (!this._fileDefinition.isView(editor.document.fileName)) {
			return;
		}
		this._decorationsList.reset();
		const text = editor.document.getText();
		const parsingResult = AmlParsing.parse(text); // TODO do not parse again
		const decorator = new BaseDecorator(this._decorationsList, editor);
		const highlighter = new ViewFileHighlight(decorator);
		highlighter.highlight(parsingResult.token);
		// Apply all decorations
		for (const data of this._decorationsList.list) {
			editor.setDecorations(data.decorationType, data.decorations);
		}
	}
}

// create a decorator type that we use to decorate small numbers
/*const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
	borderWidth: '1px',
	borderStyle: 'solid',
	overviewRulerColor: 'blue',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	light: {
		// this color will be used in light color themes
		borderColor: 'darkblue'
	},
	dark: {
		// this color will be used in dark color themes
		borderColor: 'lightblue'
	}
});

// create a decorator type that we use to decorate large numbers
const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
	cursor: 'crosshair',
	color: 'green',
});*/
