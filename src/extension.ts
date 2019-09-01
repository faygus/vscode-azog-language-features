import * as azog from "azog";
import * as vscode from 'vscode';
import { LanguageFeatures } from '../lib/activate-features';
import { MockDataProviders } from '../lib/business/data-source/mock/data-providers';
import { ParsingInfos } from '../lib/parsing-manager';
import { IProvider } from '../lib/provider';
import { FileRegister, WorkspaceFilesWatcher, BaseFileRegistry, IFilesRegistry } from "workspace-listener";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('extension activated !!');
	const dataProviders = new MockDataProviders(); // TODO
	const rootPath = vscode.workspace.rootPath;
	if (!rootPath) {
		console.warn('no workspace opened');
		return;
	}
	const workspaceWatcher = new WorkspaceFilesWatcher(rootPath);
	let registry: IFilesRegistry<ParsingInfos>;
	const documentSelector = (filePath: string) => {
		return path.extname(filePath) === '.aml';
	}
	const provider: IProvider = {
		registerParser(parser) {
			const p = new FileRegister(parser.parse);
			registry = workspaceWatcher.registerFileType(documentSelector, p);
		},
		fileRegistry: {
			views: new BaseFileRegistry<ParsingInfos>(() => registry.files),
			pipes: new BaseFileRegistry<azog.Models.IPipeInterface>(() => []) // TODO
		},
		getFileViewSelector(path: string) {
			return documentSelector(path);
		}
	};
	workspaceWatcher.init();
	context.subscriptions.push(LanguageFeatures.activate(provider));
	context.subscriptions.push(workspaceWatcher);
}

export function deactivate() { }
