import * as AzogInterface from "azog-interface";

export interface IViewInterpretation {
	viewModelInterface: AzogInterface.IViewModelInterfaceJSON | undefined;
	template: AzogInterface.IViewJSON | undefined;
}

export class Interpretations {
	private _map: Map<string, IViewInterpretation> = new Map();

	set(documentId: string, interpretation: IViewInterpretation): void {
		this._map.set(documentId, interpretation);
	}

	get(documentId: string): IViewInterpretation | undefined {
		return this._map.get(documentId);
	}
}

export class InterpretationProvider {
	static data = new Interpretations();
}
