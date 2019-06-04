import * as vscode from 'vscode';

export class BaseHoverProvider implements vscode.HoverProvider {
	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Hover> {
		const wordRange = document.getWordRangeAtPosition(position);
		if (!wordRange) return;
		const word = getWord(document.getText(), wordRange);
		return {
			contents: [word]
		}
	}
}

function getWord(text: string, range: vscode.Range): string {
	const lines = text.split('\n');
	const line = lines[range.start.line];
	const length = range.end.character - range.start.character;
	const slice = line.substr(range.start.character, length);
	const words = slice.split(' ');
	if (words.length > 0) {
		const word = words[0];
		return word;
	}
	return '';
}
