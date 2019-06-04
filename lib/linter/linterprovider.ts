import * as vscode from 'vscode';
import { XmlDiagnosticData } from '../types';

export abstract class XmlLinterProvider implements vscode.Disposable {

	private documentListener: vscode.Disposable;
	private diagnosticCollection: vscode.DiagnosticCollection;
	private delayCount: number = 0;
	private textDocument: vscode.TextDocument;
	protected _defaultDelay = 500; // ms

	constructor(protected extensionContext: vscode.ExtensionContext) {
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
		this.documentListener = vscode.workspace.onDidChangeTextDocument(evnt =>
			this.triggerDelayedLint(evnt.document), this, this.extensionContext.subscriptions);
		vscode.workspace.onDidOpenTextDocument(doc =>
			this.triggerDelayedLint(doc, 100), this, extensionContext.subscriptions);
		vscode.workspace.onDidCloseTextDocument(doc =>
			this.cleanupDocument(doc), null, extensionContext.subscriptions);
		vscode.workspace.textDocuments.forEach(doc =>
			this.triggerDelayedLint(doc, 100), this);
	}

	public dispose() {
		this.documentListener.dispose();
		this.diagnosticCollection.clear();
	}

	private cleanupDocument(textDocument: vscode.TextDocument): void {
		this.diagnosticCollection.delete(textDocument.uri);
	}

	private async triggerDelayedLint(textDocument: vscode.TextDocument, timeout: number = this._defaultDelay): Promise<void> {
		if (this.delayCount > 0) {
			this.delayCount = timeout;
			this.textDocument = textDocument;
			return;
		}
		this.delayCount = timeout;
		this.textDocument = textDocument;

		const tick = 100;

		while (this.delayCount > 0) {
			await new Promise(resolve => setTimeout(resolve, tick));
			this.delayCount -= tick;
		}

		this.triggerLint(this.textDocument);
	}

	private async triggerLint(textDocument: vscode.TextDocument): Promise<void> {
		if (textDocument.languageId !== 'xml') { // TODO
			return;
		}
		const diagnostics: Array<vscode.Diagnostic[]> = new Array<vscode.Diagnostic[]>();
		try {
			const text = textDocument.getText();
			const diagnosticResults = await this.getDiagnostics(text);
			diagnostics.push(this.getDiagnosticArray(diagnosticResults));

			this.diagnosticCollection.set(textDocument.uri, diagnostics
				.reduce((prev, next) => prev.filter(dp => next.find(dn => dn.range.start.compareTo(dp.range.start) === 0))));
		}
		catch (err) {
			vscode.window.showErrorMessage(err.toString());
		}
	}

	private getDiagnosticArray(data: XmlDiagnosticData[]): vscode.Diagnostic[] {
		return data.map(r => {
			const start = new vscode.Position(r.position.start.line, r.position.start.column);
			const end = new vscode.Position(r.position.end.line, r.position.end.column);
			const range = new vscode.Range(start, end);
			let severity = (r.severity === "error") ? vscode.DiagnosticSeverity.Error :
				(r.severity === "warning") ? vscode.DiagnosticSeverity.Warning :
					(r.severity === "info") ? vscode.DiagnosticSeverity.Information :
						vscode.DiagnosticSeverity.Hint;
			return new vscode.Diagnostic(range, r.message, severity);
		});
	}

	protected abstract getDiagnostics(text: string): Promise<XmlDiagnosticData[]>;
}

/*async function getXmlTagCollections(text: string, schemaPropertiesArray: XmlSchemaPropertiesArray): Promise<XmlTagCollection[]> {
	let xsdFileUris = [vscode.Uri.parse(
		"file:///Users/j-sdurier/Documents/development/tests/vscode-xml-complete/example/note.xsd"
	)];
	let xsdFileUris = (await XmlSimpleParser.getSchemaXsdUris(text, globalSettings.schemaMapping))
		.map(u => vscode.Uri.parse(u))
		.filter((v, i, a) => a.findIndex(u => u.toString() === v.toString()) === i);
	if (xsdFileUris.length === 0) {
		return [new XmlTagCollection()];
	}
	const res: XmlTagCollection[] = [];
	for (let xsdUri of xsdFileUris) {
		let schemaProperties = schemaPropertiesArray.get(xsdUri);
		if (schemaProperties === undefined) {
			schemaProperties = { schemaUri: xsdUri, xsdContent: ``, tagCollection: new XmlTagCollection() } as XmlSchemaProperties;
			try {
				schemaProperties.xsdContent = await XsdLoader.loadSchemaContentsFromUri(xsdUri.toString(true));
				schemaProperties.tagCollection = await XsdParser.getSchemaTagsAndAttributes(schemaProperties.xsdContent);
				vscode.window.showInformationMessage(`Loaded ...${xsdUri.toString().substr(xsdUri.path.length - 16)}`);
			}
			catch (err) {
				vscode.window.showErrorMessage(err.toString());
			} finally {
				schemaPropertiesArray.push(schemaProperties);
			}
		}
		// const strict = !globalSettings.schemaMapping.find(m => m.xsdUri === xsdUri.toString() && m.strict === false);
		res.push(schemaProperties.tagCollection);
	}
	return res;
}*/
