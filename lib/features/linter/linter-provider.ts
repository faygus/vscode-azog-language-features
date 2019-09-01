import * as vscode from 'vscode';
import { EditorEventListener } from '../../utils/document-listener';
import { AmlDiagnosticData } from '../../business/diagnostic/diagnostic-data';
import { IFileDefinition } from '../../file-definition';

export abstract class AmlLinterProvider extends EditorEventListener {

	private diagnosticCollection: vscode.DiagnosticCollection;
	protected _defaultDelay = 500; // ms

	constructor(private _fileDefinition: (path: string) => boolean) {
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
		this.diagnosticCollection.clear();
	}

	private cleanupDocument(textDocument: vscode.TextDocument): void {
		this.diagnosticCollection.delete(textDocument.uri);
	}

	private triggerLint(textDocument: vscode.TextDocument): void {
		if (!this._fileDefinition(textDocument.fileName)) {
			return;
		}
		const diagnostics: Array<vscode.Diagnostic[]> = new Array<vscode.Diagnostic[]>();
		try {
			const text = textDocument.getText();
			const diagnosticResults = this.getDiagnostics(text);
			diagnostics.push(this.getDiagnosticArray(diagnosticResults, textDocument));

			this.diagnosticCollection.set(textDocument.uri, diagnostics
				.reduce((prev, next) => prev.filter(dp => next.find(dn => dn.range.start.compareTo(dp.range.start) === 0))));
		}
		catch (err) {
			vscode.window.showErrorMessage(err.toString());
		}
	}

	private getDiagnosticArray(data: AmlDiagnosticData[], textDocument: vscode.TextDocument): vscode.Diagnostic[] {
		return data.map(r => {
			const start = textDocument.positionAt(r.position.start);
			const end = textDocument.positionAt(r.position.end);
			const range = new vscode.Range(start, end);
			let severity = (r.severity === "error") ? vscode.DiagnosticSeverity.Error :
				(r.severity === "warning") ? vscode.DiagnosticSeverity.Warning :
					(r.severity === "info") ? vscode.DiagnosticSeverity.Information :
						vscode.DiagnosticSeverity.Hint;
			return new vscode.Diagnostic(range, r.message, severity);
		});
	}

	protected abstract getDiagnostics(text: string): AmlDiagnosticData[];
}
