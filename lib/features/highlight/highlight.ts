import * as AmlParsing from "aml-parsing";
import * as vscode from "vscode";
import { IFileDefinition } from "../../file-definition";
import { EditorEventListener } from "../../utils/document-listener";
import { DecorationsList } from "./decoration-list";
import { ExpressionHighlight } from "./expression/highlight";
import { getDecorationStyle } from "./get-decoration-style";
import { BaseDecorator } from "./i-decorator";
import { ObjectHighlight } from "./object/highlight";
import { Scope } from "./scope";
import { convertRange } from "./utils";

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
	}

	private async triggerHighlight(editor: vscode.TextEditor) {
		if (!this._fileDefinition.isView(editor.document.fileName)) {
			return;
		}
		this._decorationsList.reset();
		const text = editor.document.getText();
		const parsingResult = AmlParsing.parseAmlCode(text); // TODO do not parse again
		const decorations: { [key: number]: vscode.DecorationOptions[] } = {
			[Scope.TAG]: [],
			[Scope.ATTRIBUTE_NAME]: [],
			[Scope.ATTRIBUTE_VALUE]: []
		};
		for (const token of parsingResult.tokens) {
			const tokenUnit = token.tokenUnit;
			const info: vscode.DecorationOptions = {
				range: convertRange(tokenUnit.range, editor.document)
			};
			if (token instanceof AmlParsing.Model.Aml.TagToken) {
				decorations[Scope.TAG].push(info);
			} else if (token instanceof AmlParsing.Model.Aml.AtributeNameToken) {
				decorations[Scope.ATTRIBUTE_NAME].push(info);
			} else if (token instanceof AmlParsing.Model.Aml.AttributeValueToken) {
				if (!token.content) {
					decorations[Scope.ATTRIBUTE_VALUE].push(info);
				}
				const decorator = new BaseDecorator(this._decorationsList, token.tokenUnit.offset, editor);
				if (token.content instanceof AmlParsing.Model.Expression.ExpressionTokensList) {
					const highlighManager = new ExpressionHighlight(decorator);
					highlighManager.highlight(token.content);
				} else if (token.content instanceof AmlParsing.Model.Json.ObjectTokensList) {
					const highlighManager = new ObjectHighlight(decorator);
					highlighManager.highlight(token.content);
				}
			}
		}
		for (const scopeStr in decorations) {
			const scope = Number(scopeStr);
			const decorationStyle = getDecorationStyle(scope);
			this._decorationsList.addDecoration(decorationStyle, decorations[scope]);
		}
		// Apply all decorations
		for (const data of this._decorationsList.list) {
			editor.setDecorations(data.decorationType, data.decorations);
		}
	}
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
