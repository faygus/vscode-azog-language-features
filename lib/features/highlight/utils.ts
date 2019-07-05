import * as AmlParsing from "aml-parsing";
import * as vscode from 'vscode';

export function convertRange(range: AmlParsing.Range, document: vscode.TextDocument): vscode.Range {
	const start = document.positionAt(range.start);
	const end = document.positionAt(range.end);
	const res = new vscode.Range(start, end);
	return res;
}
