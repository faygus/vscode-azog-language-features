import * as vscode from 'vscode';
import AutoCompletionProvider from '../lib/auto-completion-provider';
import XmlCompletionItemProvider from '../lib/features/completion/completion-item-provider';
import { AzogLinter } from '../lib/features/linter/azog-linter';
import { XmlInterpreter } from '../lib/interpreter/interpreter';
import { XmlCompleteSettings } from '../lib/types';

export declare let globalSettings: XmlCompleteSettings;

export const languageId: string = 'xml';

export function activate(context: vscode.ExtensionContext) {

	vscode.workspace.onDidChangeConfiguration(loadConfiguration, undefined, context.subscriptions);
	loadConfiguration();
	let completionitemprovider = vscode.languages.registerCompletionItemProvider(
		getDocumentSelector(),
		new XmlCompletionItemProvider(context),
		'"', '<');

	/*let formatprovider = vscode.languages.registerDocumentFormattingEditProvider(
		getDocumentSelector(),
		new XmlFormatProvider(context, schemaPropertiesArray));*/

	/*let rangeformatprovider = vscode.languages.registerDocumentRangeFormattingEditProvider(
		getDocumentSelector(),
		new XmlRangeFormatProvider(context, schemaPropertiesArray));*/

	let linterprovider = new AzogLinter(context);

	let autocompletionprovider = new AutoCompletionProvider();
	let xmlInterpreter = new XmlInterpreter();
	// const hoverDisposable = vscode.languages.registerHoverProvider('xml', new BaseHoverProvider());

	context.subscriptions.push(
		completionitemprovider,
		// formatprovider,
		// rangeformatprovider,
		linterprovider,
		autocompletionprovider,
		xmlInterpreter,
		// hoverDisposable
	);
}

function loadConfiguration(): void {
	const section = vscode.workspace.getConfiguration('xmlComplete', null);
	globalSettings = new XmlCompleteSettings();
	globalSettings.formattingStyle = section.get('formattingStyle', "singleLineAttributes");
}

function getDocumentSelector(): vscode.DocumentSelector {
	return {
		// language: languageId,
		scheme: 'file',
		pattern: '**/views/*.xml'
	};
}

export function deactivate() { }
