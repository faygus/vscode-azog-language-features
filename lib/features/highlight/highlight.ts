import * as AmlParsing from "aml-parsing";
import * as vscode from 'vscode';
import { EditorEventListener } from '../../utils/document-listener';
import { getDecorationStyle } from './get-decoration-style';
import { Scope } from './scope';

export class HighlightManager extends EditorEventListener {

	private _openedEditors: vscode.TextEditor[] = [];

	constructor() {
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
	}

	private async triggerHighlight(editor: vscode.TextEditor) {
		const text = editor.document.getText();
		const parsingResult = AmlParsing.parseAmlCode(text);
		const decorations: { [key: number]: vscode.DecorationOptions[] } = {
			[Scope.TAG]: [],
			[Scope.ATTRIBUTE_NAME]: [],
			[Scope.ATTRIBUTE_VALUE]: []
		};
		for (const tokenWithContext of parsingResult.tokens) {
			const token = tokenWithContext.token;
			const info: vscode.DecorationOptions = {
				range: convertRange(token.range, editor.document)
			};
			const scope = getScope(token.type);
			if (scope !== undefined) decorations[scope].push(info);
		}
		for (const scopeStr in decorations) {
			const scope = Number(scopeStr);
			const decorationStyle = getDecorationStyle(scope);
			editor.setDecorations(decorationStyle, decorations[scope]);
		}
	}
}

function getScope(type: AmlParsing.AmlTokenType): Scope {
	return tokenTypeToScope[type];
}

const tokenTypeToScope = {
	[AmlParsing.AmlTokenType.TAG]: Scope.TAG,
	[AmlParsing.AmlTokenType.ATTRIBUTE_NAME]: Scope.ATTRIBUTE_NAME,
	[AmlParsing.AmlTokenType.ATTRIBUTE_VALUE]: Scope.ATTRIBUTE_VALUE,
	[AmlParsing.AmlTokenType.JSON_KEY]: Scope.ATTRIBUTE_NAME,
	[AmlParsing.AmlTokenType.JSON_LITERAL_VALUE]: Scope.ATTRIBUTE_VALUE,
};

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

function convertRange(range: AmlParsing.Range, document: vscode.TextDocument): vscode.Range {
	const start = document.positionAt(range.start);
	const end = document.positionAt(range.end);
	const res = new vscode.Range(start, end);
	return res;
}
