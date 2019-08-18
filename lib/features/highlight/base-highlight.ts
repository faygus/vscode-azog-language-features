import { IPaletteColors } from "./palette-colors";
import * as vscode from "vscode";
import { Token } from "code-parsing";
import { IDecorator } from "./i-decorator";

export abstract class BaseHighlight<T> {
	protected abstract _colors: IPaletteColors;

	private _decorationStyles: { [key: number]: vscode.TextEditorDecorationType };
	private _decorations: { [key: number]: vscode.DecorationOptions[] };

	constructor(protected _decorator: IDecorator) {

	}

	highlight(data: T): void {
		this._decorations = {};
		this._highlight(data);
		for (const scopeStr in this._decorations) {
			const scope = Number(scopeStr);
			const decorationStyle = this.getDecorationStyle(scope);
			this._decorator.setDecorations(decorationStyle, this._decorations[scope]);
		}
	}

	protected abstract _highlight(data: T): void;

	protected highlightToken(token: Token, scope: number): void {
		if (!token) return;
		const info: vscode.DecorationOptions = {
			range: this._decorator.convertRange(token.tokenUnit.range)
		};
		if (!this._decorations[scope]) {
			this._decorations[scope] = [];
		}
		this._decorations[scope].push(info);
	}

	protected getDecorationStyle(scope: number): vscode.TextEditorDecorationType {
		if (!this._decorationStyles) {
			this._decorationStyles = <any>{};
			for (const scopeStr in this._colors) {
				const scope = Number(scopeStr);
				const color = this._colors[scope];
				this._decorationStyles[scope] = vscode.window.createTextEditorDecorationType({
					color: color
				});
			}
		}
		return this._decorationStyles[scope];
	}
}
