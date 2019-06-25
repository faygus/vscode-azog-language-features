import { getColorPalette } from "./get-color-palette";
import * as vscode from 'vscode';
import { Scope } from "./scope";

const palette = getColorPalette();

const decorationStyles: { [key: number]: vscode.TextEditorDecorationType } = {};
for (const scopeStr in palette) {
	const scope = Number(scopeStr);
	const color = palette[scope];
	decorationStyles[scope] = vscode.window.createTextEditorDecorationType({
		color: color
	});
}

export function getDecorationStyle(scope: Scope): vscode.TextEditorDecorationType {
	return decorationStyles[scope];
}
