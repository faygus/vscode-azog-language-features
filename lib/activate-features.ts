import * as vscode from 'vscode';
import { HighlightManager } from './features/highlight/highlight';
import { AzogLinter } from './features/linter/azog-linter';
import { ParsingManager } from './parsing-manager';
import AmlCompletionItemProvider from './features/completion/completion-item-provider';
import { MockDataProviders } from './business/data-source/mock/data-providers';
import { IDataProviders } from './business/data-source/i-data-providers';
import { IFileDefinition } from './file-definition';

export const languageId: string = 'xml';

export class LanguageFeatures {
	static activate(dataProviders: IDataProviders,
		fileDefinition: IFileDefinition): vscode.Disposable {
		const completionitemprovider = vscode.languages.registerCompletionItemProvider(
			getDocumentSelector(),
			new AmlCompletionItemProvider(dataProviders),
			...completionTriggerCharacters);

		const linterprovider = new AzogLinter(fileDefinition);

		// const autocompletionprovider = new AutoCompletionProvider();

		const highlightMananger = new HighlightManager(fileDefinition);
		const parsingManager = new ParsingManager();

		return new vscode.Disposable(() => {
			completionitemprovider.dispose();
			linterprovider.dispose();
			// autocompletionprovider.dispose();
			highlightMananger.dispose();
			parsingManager.dispose();
		});
	}
}

function getDocumentSelector(): vscode.DocumentSelector {
	return {
		// language: languageId,
		scheme: 'file',
		// pattern: '**/views/*.xml'
	};
}

const specialCharacters = { // TODO move this in aml-parsing library
	quote: '"',
	openTagBracket: '<',
	variablePrefix: '$'
};

const completionTriggerCharacters = [
	specialCharacters.quote,
	specialCharacters.openTagBracket,
	specialCharacters.variablePrefix
];
