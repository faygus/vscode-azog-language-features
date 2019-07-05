import * as AmlParsing from "aml-parsing";
import * as vscode from "vscode";
import { IPaletteColors } from "../palette-colors";
import { EmbededDecorator, IDecorator } from "../i-decorator";

export class ObjectHighlight {
	constructor(private _decorator: IDecorator) {

	}

	highlight(data: AmlParsing.Model.Json.ObjectTokensList): void {
		const decorations: { [key: number]: vscode.DecorationOptions[] } = {
			[Scope.KEY]: [],
			[Scope.VALUE]: []
		};
		for (const token of data.tokens) {
			const info: vscode.DecorationOptions = {
				range: this._decorator.convertRange(token.tokenUnit.range)
			};
			if (token instanceof AmlParsing.Model.Json.KeyToken) {
				decorations[Scope.KEY].push(info);
			} else if (token instanceof AmlParsing.Model.Json.LiteralValueToken) {
				decorations[Scope.VALUE].push(info);
			} else if (token instanceof AmlParsing.Model.Json.ObjectValueToken) {
				const offset = token.tokenUnit.offset;
				const embededEditor = new EmbededDecorator(this._decorator, offset);
				const highlightManager = new ObjectHighlight(embededEditor);
				highlightManager.highlight(token.content);
			}
		}
		for (const scopeStr in decorations) {
			const scope = Number(scopeStr);
			const decorationStyle = getDecorationStyle(scope);
			this._decorator.setDecorations(decorationStyle, decorations[scope]);
		}
	}
}

enum Scope {
	KEY,
	VALUE,
};

const colors: IPaletteColors = {
	[Scope.KEY]: '#569cd6',
	[Scope.VALUE]: '#ce9178'
};

const decorationStyles: { [key: number]: vscode.TextEditorDecorationType } = {};
for (const scopeStr in colors) {
	const scope = Number(scopeStr);
	const color = colors[scope];
	decorationStyles[scope] = vscode.window.createTextEditorDecorationType({
		color: color
	});
}

export function getDecorationStyle(scope: Scope): vscode.TextEditorDecorationType {
	return decorationStyles[scope];
}
