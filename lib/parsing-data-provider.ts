import * as AmlParsing from "aml-parsing";
import * as vscode from 'vscode';

export class ParsingResults {
	private _map: Map<string, AmlParsing.ParsingResult> = new Map();

	set(document: vscode.TextDocument, parsingResult: AmlParsing.ParsingResult): void {
		this._map.set(document.fileName, parsingResult);
	}

	get(document: vscode.TextDocument): AmlParsing.ParsingResult | undefined {
		return this._map.get(document.fileName);
	}
}

export class ParsingDataProvider {
	static parsingResults = new ParsingResults();
}
