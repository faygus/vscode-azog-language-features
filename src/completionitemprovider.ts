import * as vscode from 'vscode';
import { XmlSchemaPropertiesArray } from './types';

export default class XmlCompletionItemProvider implements vscode.CompletionItemProvider {

	constructor(protected extensionContext: vscode.ExtensionContext, protected schemaPropertiesArray: XmlSchemaPropertiesArray) {
	}

	async provideCompletionItems(textDocument: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, _context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
		/*let documentContent = textDocument.getText();
		let offset = textDocument.offsetAt(position);
		//let xsdFileUris = (await XmlSimpleParser.getSchemaXsdUris(documentContent, globalSettings.schemaMapping))
			//.map(u => vscode.Uri.parse(u));

		let xsdFileUris = [vscode.Uri.parse(
			"file:///Users/j-sdurier/Documents/development/tests/vscode-xml-complete/example/note.xsd"
		)];

		let scope = await XmlSimpleParser.getScopeForPosition(documentContent, offset);

		let resultTexts: CompletionString[];

		if (token.isCancellationRequested) {
			resultTexts = [];

		} else if (scope.context === "text") {
			resultTexts = [];

		} else if (scope.tagName === undefined) {
			resultTexts = [];

		} else if (scope.context === "element" && scope.tagName.indexOf(".") < 0) {
			resultTexts = this.schemaPropertiesArray
				.filterUris(xsdFileUris)
				.map(sp => sp.tagCollection.filter(e => e.visible).map(e => e.tag))
				.reduce((prev, next) => prev.concat(next), [])
				.sort()
				.filter((v, i, a) => a.findIndex(e => e.name === v.name && e.comment === v.comment ) === i);

		} else if (scope.context !== undefined) {
			resultTexts = this.schemaPropertiesArray
				.filterUris(xsdFileUris)
				.map(sp => sp.tagCollection.loadAttributes(scope.tagName ? scope.tagName.replace(".", "") : undefined))
				.reduce((prev, next) => prev.concat(next), [])
				.sort()
				.filter((v, i, a) => a.findIndex(e => e.name === v.name && e.comment === v.comment ) === i);

		} else {
			resultTexts = [];
		}

		return resultTexts
			.map(t => {
				let ci = new vscode.CompletionItem(t.name, vscode.CompletionItemKind.Snippet);
				ci.detail = scope.context;
				ci.documentation = t.comment;
				return ci;
			});*/
		return []; // TODO
	}
}
