import * as vscode from 'vscode';
import { LanguageFeatures } from '../lib/activate-features';
import { MockDataProviders } from '../lib/business/data-source/mock/data-providers';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('extension activated !!');
	const dataProviders = new MockDataProviders(); // TODO
	context.subscriptions.push(LanguageFeatures.activate(dataProviders));
}

export function deactivate() { }
