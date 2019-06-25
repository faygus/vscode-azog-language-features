import * as vscode from 'vscode';
import { LanguageFeatures } from '../lib/activate-features';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('extension activated !!');
	context.subscriptions.push(LanguageFeatures.activate());
}

export function deactivate() { }
