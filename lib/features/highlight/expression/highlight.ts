import * as AmlParsing from "aml-parsing";
import * as vscode from "vscode";
import { IDecorator } from "../i-decorator";
import { IPaletteColors } from "../palette-colors";

export class ExpressionHighlight {
	constructor(private _decorator: IDecorator) {

	}

	highlight(data: AmlParsing.Model.Expression.ExpressionTokensList): void {
		const decorations: { [key: number]: vscode.DecorationOptions[] } = {
			[Scope.LITERAL_ARGUMENT]: [],
			[Scope.VARIABLE_ARGUMENT]: [],
			[Scope.PIPE]: []
		};
		for (const token of data.tokens) {
			const info: vscode.DecorationOptions = {
				range: this._decorator.convertRange(token.tokenUnit.range)
			};
			if (token instanceof AmlParsing.Model.Expression.LiteralArgumentToken) {
				decorations[Scope.LITERAL_ARGUMENT].push(info);
			} else if (token instanceof AmlParsing.Model.Expression.VariableArgumentToken) {
				decorations[Scope.VARIABLE_ARGUMENT].push(info);
			} else if (token instanceof AmlParsing.Model.Expression.PipeToken) {
				decorations[Scope.PIPE].push(info);
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
	LITERAL_ARGUMENT,
	VARIABLE_ARGUMENT,
	PIPE
};

const colors: IPaletteColors = {
	[Scope.LITERAL_ARGUMENT]: 'red',
	[Scope.VARIABLE_ARGUMENT]: 'orange',
	[Scope.PIPE]: 'purple',
};

const decorationStyles: { [key: number]: vscode.TextEditorDecorationType } = {};
for (const scopeStr in colors) {
	const scope = Number(scopeStr);
	const color = colors[scope];
	decorationStyles[scope] = vscode.window.createTextEditorDecorationType({
		color: color
	});
	const a = vscode.window.createTextEditorDecorationType({
		color: color
	});
}

export function getDecorationStyle(scope: Scope): vscode.TextEditorDecorationType {
	return decorationStyles[scope];
}