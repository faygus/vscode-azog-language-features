import * as vscode from 'vscode';
import XmlSimpleParser from './helpers/xmlsimpleparser';
import { CompletionString } from './types';
import { XmlDocumentRules } from './types/document-rules';
import documentRules from "./language/language-specifications";
import { capitalize, antiCapitalize } from './utils/string-utils';

export default class XmlCompletionItemProvider implements vscode.CompletionItemProvider {

	constructor(protected extensionContext: vscode.ExtensionContext) {
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
		const scope = await XmlSimpleParser.getScopeForPosition(documentContent, offset);

		if (token.isCancellationRequested ||
			scope.context === "text" ||
			scope.tagName === undefined ||
			scope.context === undefined) {
			return [];
		}
		let resultTexts: CompletionString[];
		if (scope.context === "element" && scope.tagName.indexOf(".") < 0) {
			resultTexts = documentRules.elements.map(element => {
				return new CompletionString(capitalize(element.name), element.comment);
			});
		} else { // attribute
			const element = documentRules.getElement(antiCapitalize(scope.tagName));
			if (!element) {
				return [];
			}
			resultTexts = element.attributes.map(attribute => {
				return new CompletionString(attribute.name, attribute.comment);
			});
		}
		return resultTexts
			.map(t => {
				let completionItem = new vscode.CompletionItem(t.name, vscode.CompletionItemKind.Snippet);
				completionItem.detail = scope.context;
				completionItem.documentation = t.comment;
				return completionItem;
			});
	}
}
