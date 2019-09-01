import { TemplateInterpreter } from "./template";
import { ViewCodeRegistry } from "../code-registry/view";
import documentRules from "../language/language-specifications";
import { ViewModelInterpreter } from "./view-model-interface";
import { GlobalRegistry } from "../code-registry/registry";
import { IInterpretation } from "./interpretation";

class Intepreter {
	private _template: TemplateInterpreter;
	private _viewModel: ViewModelInterpreter;
	private _viewCodeRegistry: ViewCodeRegistry;

	getInterpretation(filePath: string): IInterpretation | undefined {
		this.init();
		const file = GlobalRegistry.registry.views.getFile(filePath);
		if (!file || !file.infos) {
			return undefined;
		}
		console.log('getInterpretation', filePath, file);
		const interpretation = file.infos.interpretation;
		const template = this._template.convert(interpretation.template);
		const viewModel = this._viewModel.convert(interpretation.props);
		return {
			template: template.template,
			viewModel,
			dependencies: template.dependencies
		};
	}

	getInterpretationFromId(id: number): IInterpretation | undefined {
		this.init();
		const file = this._viewCodeRegistry.getById(id);
		if (!file) {
			console.warn('no file with id', id);
			return undefined;
		}
		return this.getInterpretation(file.path);
	}

	getPathFromId(id: number): string | undefined {
		this.init();
		const file = this._viewCodeRegistry.getById(id);
		if (!file) return undefined;
		return file.path;
	}

	getIdFromPath(path: string): number {
		this.init();
		return this._viewCodeRegistry.getIdFromPath(path);
	}

	private init(): void {
		if (!this._template && !this._viewModel && !this._viewCodeRegistry) {
			this._viewCodeRegistry = new ViewCodeRegistry(GlobalRegistry.registry.views);
			this._template = new TemplateInterpreter(this._viewCodeRegistry, documentRules);
			this._viewModel = new ViewModelInterpreter();
		}
	}
}

export class StaticInterpreter {
	private static _intepreter = new Intepreter();

	static getInterpretation(filePath: string): IInterpretation | undefined {
		return StaticInterpreter._intepreter.getInterpretation(filePath);
	}

	static getInterpretationFromId(id: number): IInterpretation | undefined {
		return StaticInterpreter._intepreter.getInterpretationFromId(id);
	}

	static getPathFromId(id: number): string | undefined {
		return StaticInterpreter._intepreter.getPathFromId(id);
	}

	static getIdFromPath(path: string): number {
		return StaticInterpreter._intepreter.getIdFromPath(path);
	}
}
