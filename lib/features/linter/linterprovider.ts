import * as vscode from 'vscode';
import { XmlDiagnosticData } from '../../types';
import { EditorEventListener } from '../../utils/document-listener';

export abstract class XmlLinterProvider extends EditorEventListener {

	private documentListener: vscode.Disposable;
	private diagnosticCollection: vscode.DiagnosticCollection;
	protected _defaultDelay = 500; // ms

	constructor() {
		super();
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
		this.listen(vscode.workspace.onDidChangeTextDocument, (event) => {
			this.triggerLint(event.document);
		});
		this.listen(vscode.workspace.onDidOpenTextDocument, (event) => {
			this.triggerLint(event);
		});
		this.listen(vscode.workspace.onDidCloseTextDocument, (event) => {
			this.cleanupDocument(event);
		});
		this.listen(vscode.workspace.onDidCloseTextDocument, (event) => {
			this.triggerLint(event);
		});
		vscode.workspace.textDocuments.forEach(doc => {
			setTimeout(() => {
				this.triggerLint(doc);
			}, 100);
		});
	}

	public dispose() {
		this.documentListener.dispose();
		this.diagnosticCollection.clear();
	}

	private cleanupDocument(textDocument: vscode.TextDocument): void {
		this.diagnosticCollection.delete(textDocument.uri);
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
