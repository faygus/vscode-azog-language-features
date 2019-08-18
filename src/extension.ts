import * as vscode from 'vscode';
import { LanguageFeatures } from '../lib/activate-features';
import { MockDataProviders } from '../lib/business/data-source/mock/data-providers';
import { IFileDefinition } from '../lib/file-definition';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('extension activated !!');
	const dataProviders = new MockDataProviders(); // TODO
	const fileDefinition: IFileDefinition = {
		isView(filePath: string) {
			return true; // TODO
		}
	}
	context.subscriptions.push(LanguageFeatures.activate(dataProviders, fileDefinition));
}

export function deactivate() { }
