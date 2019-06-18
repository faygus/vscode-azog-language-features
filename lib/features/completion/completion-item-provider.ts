import * as vscode from 'vscode';
import documentRules from "../../language/language-specifications";
import { CompletionString } from '../../types';
import { computeCompletion } from './utils/compute';
import { XmlEditionType } from '../../utils/parsing/types';

export default class XmlCompletionItemProvider implements vscode.CompletionItemProvider {

	constructor() {
	}

	/**
	 * gives suggestions to the user when he edits a document
	 */
	async provideCompletionItems(
		textDocument: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		_context: vscode.CompletionContext
	): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
		const documentContent = textDocument.getText();
		const offset = textDocument.offsetAt(position);
		const completionInfos = await computeCompletion(documentContent, offset, documentRules);
		if (token.isCancellationRequested || completionInfos === undefined) {
			return [];
		}
		return completionInfos.completionStrings.map(t => {
			const res = convertCompletionItem(t, ''); // TODO add a detail string (element, attribute, text)
			// TODO res.insertText = '="';
			if (completionInfos.scope === XmlEditionType.ATTRIBUTE_NAME) {
				res.insertText = `${t.name}=`;
			}
			return res;
		});
	}
}

function convertCompletionItem(data: CompletionString, detail: string | undefined): vscode.CompletionItem {
	let completionItem = new vscode.CompletionItem(data.name,
		vscode.CompletionItemKind.Snippet);
	completionItem.detail = detail,
		completionItem.documentation = data.comment;
	return completionItem;
}
