import * as AmlParsing from "aml-parsing";
import { IViewJSON, IViewModelInterfaceJSON } from "azog-interface";
import { ICodeParsingResult } from "code-parsing";
import * as convert from "./interpreter";
import documentRules from "./language/language-specifications";

export type ParsingInfos = ICodeParsingResult<AmlParsing.ViewFile.Token, AmlParsing.ViewFile.DiagnosticType, AmlParsing.ViewFile.Interpretation>;

export interface IRegister {
	register(parser: IParser): void;
}

export interface IParser {
	parse(data: string): ParsingInfos;
}

export class ParsingManager implements IParser {

	parse(text: string): ParsingInfos {
		const parsingResult = AmlParsing.parse(text);
		/*const interpretation = parsingResult.interpretation;
		let viewModelInterface: IViewModelInterfaceJSON | undefined = undefined;
		let template: IViewJSON | undefined = undefined;
		try {
			viewModelInterface = convert.convertViewModelInterface(interpretation.props);
		} catch (err) {

		}
		try {
			template = convert.convertTemplate(interpretation.template, documentRules);
		} catch (err) {

		}*/
		return parsingResult;
	}
}
