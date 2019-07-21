/*import * as vscode from "vscode";

export class DocumentRegistry {
	private static _counter = 0;
	private static _documents: Map<string, number> = new Map();

	static getDocumentId(document: vscode.TextDocument): number {
		const res = DocumentRegistry._documents.get(document.fileName);
		if (res !== undefined) return res;
		DocumentRegistry._documents.set(document.fileName, ++DocumentRegistry._counter);
		return DocumentRegistry._counter;
	}
}
*/