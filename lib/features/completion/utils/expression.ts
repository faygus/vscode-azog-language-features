import * as AmlParsing from "aml-parsing";
import { ICompletionInfos } from "./i-completion-infos";
import { CompletionString } from "../../../types";
import { XmlEditionType } from "../../../utils/parsing/types/xml-edition";
import { IDataProvider } from "../../../business/data-source/i-data-provider";

export function autoCompleteExpression(
	groupOfTokens: AmlParsing.Model.Expression.ExpressionTokensList,
	relativeOffset: number,
	dataProvider: IDataProvider): ICompletionInfos | undefined {
	const token = groupOfTokens.getTokenAt(relativeOffset);
	console.log('autoCompleteExpression', relativeOffset);
	if (!token) {
		return undefined;
	}
	const text = token.tokenUnit.text;
	if (token instanceof AmlParsing.Model.Expression.VariableArgumentToken) {
		return autoCompleteVariable(text, dataProvider);
	}
	if (token instanceof AmlParsing.Model.Expression.PipeToken) {
		return autoCompletePipe(text, dataProvider);
	}
}

function autoCompleteVariable(name: string,
	dataProvider: IDataProvider): ICompletionInfos | undefined {
	console.log('autoCompleteVariable', name);
	const completionStrings = dataProvider.properties.map(a => {
		return new CompletionString(a.name, 'hey man'); // TODO
	});
	return {
		scope: XmlEditionType.ATTRIBUTE_VALUE, // TODO
		completionStrings
	};
}

function autoCompletePipe(name: string,
	dataProvider: IDataProvider): ICompletionInfos | undefined {
	console.log('autoCompletePipe', name);
	const completionStrings = dataProvider.pipes.map(p => {
		return new CompletionString(p.name, 'hey man'); // TODO
	})
	return {
		scope: XmlEditionType.ATTRIBUTE_VALUE, // TODO
		completionStrings
	};
}
