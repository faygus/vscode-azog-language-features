import { AmlDiagnosticDataManager } from "../../business/diagnostic/get-diagnostic-data";
import documentRules from "../../language/language-specifications";
import { AmlLinterProvider } from "./linter-provider";
import { AmlDiagnosticData } from "../../business/diagnostic/diagnostic-data";
import { IFileDefinition } from "../../file-definition";

export class AzogLinter extends AmlLinterProvider {
	private _diagnosticDataManager: AmlDiagnosticDataManager;

	constructor(fileDefinition: (path: string) => boolean) {
		super(fileDefinition);
		this._diagnosticDataManager = new AmlDiagnosticDataManager(documentRules);
	}

	protected getDiagnostics(text: string): AmlDiagnosticData[] {
		return this._diagnosticDataManager.diagnostic(text);
	}
}
