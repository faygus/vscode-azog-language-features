import { AmlDiagnosticDataManager } from "../../diagnostic/get-diagnostic-data";
import documentRules from "../../language/language-specifications";
import { AmlLinterProvider } from "./linter-provider";
import { AmlDiagnosticData } from "../../diagnostic/diagnostic-data";

export class AzogLinter extends AmlLinterProvider {
	private _diagnosticDataManager: AmlDiagnosticDataManager;

	constructor() {
		super();
		this._diagnosticDataManager = new AmlDiagnosticDataManager(documentRules);
	}

	protected getDiagnostics(text: string): AmlDiagnosticData[] {
		return this._diagnosticDataManager.diagnostic(text);
	}
}
