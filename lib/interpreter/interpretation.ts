import * as AzogInterface from "azog-interface";

export interface IInterpretation {
	template: AzogInterface.IViewJSON;
	viewModel: AzogInterface.IViewModelInterfaceJSON;
	dependencies: {
		views: number[];
	};
}
