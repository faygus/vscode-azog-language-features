import * as vscode from 'vscode';
import { HighlightManager } from './features/highlight/highlight';
import { AzogLinter } from './features/linter/azog-linter';
import { ParsingManager } from './parsing-manager';
import AmlCompletionItemProvider from './features/completion/completion-item-provider';

export const languageId: string = 'xml';

export class LanguageFeatures {
	static activate(): vscode.Disposable {
		const completionitemprovider = vscode.languages.registerCompletionItemProvider(
			getDocumentSelector(),
			new AmlCompletionItemProvider(),
			'"', '<');

		const linterprovider = new AzogLinter();

		// const autocompletionprovider = new AutoCompletionProvider();

		const highlightMananger = new HighlightManager();
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
