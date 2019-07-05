import * as AmlParsing from "aml-parsing";
import * as vscode from 'vscode';

export class ParsingResults {
	private _map: Map<string, AmlParsingData> = new Map();

	set(document: vscode.TextDocument, parsingResult: AmlParsingData): void {
		this._map.set(document.fileName, parsingResult);
	}

	get(document: vscode.TextDocument): AmlParsingData | undefined {
		return this._map.get(document.fileName);
	}
}

export class ParsingDataProvider {
	static parsingResults = new ParsingResults();
}

export type AmlParsingData = {
	parsingResult: AmlParsing.AmlParsingResult;
	azogConversion: {} | undefined;
};
