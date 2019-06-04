import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as vscode from 'vscode';
import { xmlToJSON } from './xml-to-json';
import { dataToAzog } from './data-to-azog';

/**
 * Interprets the xml file to extract a json Data at each workspace change
 */
export class XmlInterpreter implements vscode.Disposable {

	private documentListener: vscode.Disposable;
	private _disposed$: Subject<void> = new Subject();

	constructor() {
		const documentChanged$: Subject<vscode.TextDocument> = new Subject();
		this.documentListener = vscode.workspace.onDidChangeTextDocument(event => {
			documentChanged$.next(event.document);
			// TODO onDidOpenTextDocument
		});
		documentChanged$.asObservable().pipe(
			debounceTime(500),
			takeUntil(this._disposed$)
		).subscribe(document => {
			this.interpret(document);
		})
	}

	public dispose() {
		this.documentListener.dispose();
		this._disposed$.next();
	}

	private async interpret(document: vscode.TextDocument): Promise<void> {
		const xml = document.getText();
		const azogApp = await this.getAzogData(xml);
		if (!azogApp) return;
		console.log('azogApp', JSON.stringify(azogApp));
	}

	private async getAzogData(xml: string): Promise<any> {
		const json = await xmlToJSON(xml);
		if (!json) return undefined;
		const azogApp = dataToAzog(json);
		return azogApp;
	}
}
