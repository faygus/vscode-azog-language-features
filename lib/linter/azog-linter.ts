import * as vscode from "vscode";
import { XmlLinterProvider } from "./linterprovider";
import { XmlDiagnosticDataManager } from "../diagnostic/get-diagnostic-data";
import { XmlDiagnosticData } from "../types";
import { XmlDocumentRules, XmlElement, XmlAttribute } from "../types/document-rules";
import documentRules from "../language/language-specifications";

export class AzogLinter extends XmlLinterProvider {
	private _diagnosticDataManager: XmlDiagnosticDataManager;

	constructor(extensionContext: vscode.ExtensionContext) {
		super(extensionContext);
		this._diagnosticDataManager = new XmlDiagnosticDataManager(documentRules);
	}

	protected getDiagnostics(text: string): Promise<XmlDiagnosticData[]> {
		return this._diagnosticDataManager.diagnostic(text);
	}
}
