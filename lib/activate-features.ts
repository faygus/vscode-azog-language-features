import * as vscode from 'vscode';
import { HighlightManager } from './features/highlight/highlight';
import { AzogLinter } from './features/linter/azog-linter';
import { IFileDefinition } from './file-definition';
import { FileList } from './file-list';
import { ParsingManager } from './parsing-manager';
import { IProvider } from './provider';
import { GlobalRegistry } from './code-registry/registry';

export const languageId: string = 'xml';

export class LanguageFeatures {
	static activate(provider: IProvider): vscode.Disposable {
		provider.registerParser(new ParsingManager());
		GlobalRegistry.registry = provider.fileRegistry;

		/*const completionitemprovider = vscode.languages.registerCompletionItemProvider(
			getDocumentSelector(),
			new AmlCompletionItemProvider(dataProviders),
			...completionTriggerCharacters);*/

		const linterprovider = new AzogLinter(provider.getFileViewSelector);

		// const autocompletionprovider = new AutoCompletionProvider();

		const highlightMananger = new HighlightManager(provider.getFileViewSelector);
		const fileList = new FileList();
		const disposables = [
			// completionitemprovider,
			linterprovider,
			highlightMananger,
			fileList
		];
		return new vscode.Disposable(() => {
			for (const disposable of disposables) {
				disposable.dispose();
			}
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
