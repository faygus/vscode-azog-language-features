import * as vscode from "vscode";

export class DecorationsList {
	_decorations: Map<string, DecorationDetail> = new Map();

	reset(): void {
		for (const value of this._decorations.values()) {
			value.decorations = [];
		}
	}

	addDecoration(decorationType: vscode.TextEditorDecorationType, decorations: vscode.DecorationOptions[]): void {
		const key = decorationType.key;
		const data = this._decorations.get(key);
		if (!data) {
			this._decorations.set(key, {
				decorationType,
				decorations
			});
		} else {
			data.decorations.push(...decorations);
		}
	}

	get list(): DecorationDetail[] {
		return Array.from(this._decorations.values());
	}
}

interface DecorationDetail {
	decorationType: vscode.TextEditorDecorationType;
	decorations: vscode.DecorationOptions[];
}
