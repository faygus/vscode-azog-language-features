import * as vscode from 'vscode';
import AutoCompletionProvider from './auto-completion-provider';
import XmlCompletionItemProvider from './features/completion/completion-item-provider';
import { AzogLinter } from './features/linter/azog-linter';

export const languageId: string = 'xml';

export class LanguageFeatures {
	static activate(): vscode.Disposable {
		const completionitemprovider = vscode.languages.registerCompletionItemProvider(
			getDocumentSelector(),
			new XmlCompletionItemProvider(),
			'"', '<');

		const linterprovider = new AzogLinter();

		let autocompletionprovider = new AutoCompletionProvider();

		return new vscode.Disposable(() => {
			completionitemprovider.dispose();
			linterprovider.dispose();
			autocompletionprovider.dispose();
		});
	}
}

function getDocumentSelector(): vscode.DocumentSelector {
	return {
		// language: languageId,
		scheme: 'file',
		pattern: '**/views/*.xml'
	};
}
