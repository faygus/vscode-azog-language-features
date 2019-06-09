import * as vscode from 'vscode';
import AutoCompletionProvider from '../lib/autocompletionprovider';
import XmlCompletionItemProvider from '../lib/completion-item-provider';
import XmlFormatProvider from '../lib/formatprovider';
import { XmlInterpreter } from '../lib/interpreter/interpreter';
import { AzogLinter } from '../lib/linter/azog-linter';
import XmlRangeFormatProvider from '../lib/rangeformatprovider';
import { XmlCompleteSettings, XmlSchemaPropertiesArray } from '../lib/types';

export declare let globalSettings: XmlCompleteSettings;

export const languageId: string = 'xml';

export function activate(context: vscode.ExtensionContext) {

	vscode.workspace.onDidChangeConfiguration(loadConfiguration, undefined, context.subscriptions);
	loadConfiguration();

	const schemaPropertiesArray = new XmlSchemaPropertiesArray();
	let completionitemprovider = vscode.languages.registerCompletionItemProvider(
		getDocumentSelector(),
		new XmlCompletionItemProvider(context));

	/*let formatprovider = vscode.languages.registerDocumentFormattingEditProvider(
		getDocumentSelector(),
		new XmlFormatProvider(context, schemaPropertiesArray));*/

	/*let rangeformatprovider = vscode.languages.registerDocumentRangeFormattingEditProvider(
		getDocumentSelector(),
		new XmlRangeFormatProvider(context, schemaPropertiesArray));*/

	let linterprovider = new AzogLinter(context);

	let autocompletionprovider = new AutoCompletionProvider(context, schemaPropertiesArray);
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
