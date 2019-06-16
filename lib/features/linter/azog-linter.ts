import { XmlDiagnosticDataManager } from "../../diagnostic/get-diagnostic-data";
import documentRules from "../../language/language-specifications";
import { XmlDiagnosticData } from "../../types";
import { XmlLinterProvider } from "./linterprovider";

export class AzogLinter extends XmlLinterProvider {
	private _diagnosticDataManager: XmlDiagnosticDataManager;

	constructor() {
		super();
		this._diagnosticDataManager = new XmlDiagnosticDataManager(documentRules);
	}

	protected getDiagnostics(text: string): Promise<XmlDiagnosticData[]> {
		return this._diagnosticDataManager.diagnostic(text);
	}
}
