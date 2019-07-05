import * as vscode from 'vscode';
import documentRules from "../../language/language-specifications";
import { CompletionString } from '../../types';
import { computeCompletion } from './utils/compute';
import { XmlEditionType } from '../../utils/parsing/types/xml-edition';
import { ParsingDataProvider } from '../../parsing-data-provider';

export default class AmlCompletionItemProvider implements vscode.CompletionItemProvider {

	constructor() {
	}

	/**
	 * gives suggestions to the user when he edits a document
	 */
	provideCompletionItems(
		textDocument: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		_context: vscode.CompletionContext
	): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const res = syncProvideCompletionItems(textDocument, position, token, _context);
				resolve(res);
			}, 10); // we wait for ParsingDataProvider to fill parsing infos when files change
		});
	}
}

function syncProvideCompletionItems(
	textDocument: vscode.TextDocument,
	position: vscode.Position,
	token: vscode.CancellationToken,
	_context: vscode.CompletionContext): vscode.CompletionItem[] | vscode.CompletionList {
	const offset = textDocument.offsetAt(position);
	console.log('provideCompletionItems', offset);
	const parsingResults = ParsingDataProvider.parsingResults.get(textDocument);
	if (!parsingResults) {
		console.log('no parsing result');
		return new vscode.CompletionList(undefined);
	}
	const completionInfos = computeCompletion(parsingResults.parsingResult, offset, documentRules);
	if (token.isCancellationRequested || completionInfos === undefined) {
		return new vscode.CompletionList(undefined);
	}
	if (!completionInfos) {
		return new vscode.CompletionList(undefined);
	}
	return completionInfos.completionStrings.map(t => {
		const res = convertCompletionItem(t, ''); // TODO add a detail string (element, attribute, text)
		// TODO res.insertText = '="';
		if (completionInfos.scope === XmlEditionType.ATTRIBUTE_NAME) {
			res.insertText = `${t.name}=`;
		}
		return res;
	});

	function convertCompletionItem(data: CompletionString, detail: string | undefined): vscode.CompletionItem {
		let completionItem = new vscode.CompletionItem(data.name,
			vscode.CompletionItemKind.Snippet);
		completionItem.detail = detail,
			completionItem.documentation = data.comment;
		return completionItem;
	}
}
