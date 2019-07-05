import * as AmlParsing from "aml-parsing";
import { CompletionString } from "../../../types";
import { XmlAttributeWithEnumType, XmlDocumentRules } from "../../../types/document-rules";
import { XmlEditionType } from "../../../utils/parsing/types/xml-edition";
import { antiCapitalize, capitalize } from "../../../utils/string-utils";

interface CompletionInfos {
	scope: XmlEditionType;
	completionStrings: CompletionString[];
}

export function computeCompletion(parsingResult: AmlParsing.ICodeParsingResult<
	AmlParsing.Model.Aml.Tokens,
	AmlParsing.AmlDiagnosticType,
	AmlParsing.AmlInterpretation>,
	offset: number,
	documentRules: XmlDocumentRules): CompletionInfos | undefined {

	const autoComplete = new AutoComplete(documentRules);
	const token = parsingResult.getTokenAt(offset);
	console.log('token at', offset, JSON.stringify(token));
	if (!token) return undefined;
	if (token instanceof AmlParsing.Model.Aml.TagToken) {
		return autoComplete.autoCompleteTag(token);
	}
	if (token instanceof AmlParsing.Model.Aml.AtributeNameToken) {
		return autoComplete.autoCompleteAttributeName(token);
	}
	if (token instanceof AmlParsing.Model.Aml.AttributeValueToken) {
		return autoComplete.autoCompleteAttributeValue(token);
	}
	/*case AmlParsing.AmlTokenType.JSON_KEY:
		return {
			scope: XmlEditionType.JSON_KEY,
			completionStrings: getJsonKeyCompletion(documentRules, token.context)
		};
	case AmlParsing.AmlTokenType.JSON_LITERAL_VALUE:
		return {
			scope: XmlEditionType.JSON_VALUE,
			completionStrings: getJsonValueCompletion(documentRules, token.context)
		};
}*/
	console.warn('xml edition has no type');
	return undefined;
}

function getAttributeValueCompletion(documentRules: XmlDocumentRules,
	context: AmlParsing.Model.Aml.AttributeValueCxt): CompletionString[] {
	const tag = context.tag;
	const element = documentRules.getElement(antiCapitalize(tag));
	if (!element) {
		console.warn(`no element ${tag}`);
		return [];
	}

	const attribute = element.attributes.find(a => a.name === context.attributeName);
	if (!attribute) {
		console.warn(`no attribute ${context.attributeName} in ${tag}`);
		return [];
	}
	if (XmlAttributeWithEnumType.typeIsEnum(attribute)) {
		return XmlAttributeWithEnumType.getEnum(attribute).map(value => {
			return new CompletionString(value);
		});
	}
	// TODO check if content is JSON or Expression
	return [];
}

function getJsonKeyCompletion(documentRules: XmlDocumentRules, xmlEdition: AmlParsing.AmlJsonKeyCxt): CompletionString[] {
	const tag = xmlEdition.element.tag;
	const element = documentRules.getElement(antiCapitalize(tag));
	if (!element) return [];
	const attribute = element.getAttribute(xmlEdition.attributeName);
	if (!attribute) return [];
	return attribute.getAllSubAttributes().map(a => new CompletionString(a.name)); // TODO loop in sub props
}

function getJsonValueCompletion(documentRules: XmlDocumentRules,
	xmlEdition: AmlParsing.AmlJsonLiteralValueCxt): CompletionString[] {
	const tag = xmlEdition.element.tag;
	const element = documentRules.getElement(antiCapitalize(tag));
	if (!element) {
		console.warn(`no element ${tag}`);
		return [];
	}
	const attribute = element.attributes.find(a => a.name === xmlEdition.attributeName);
	if (!attribute) {
		console.warn(`no attribute ${xmlEdition.attributeName} in ${tag}`);
		return [];
	}
	const key = xmlEdition.jsonContext.key;
	const prop = attribute.getAllSubAttributes().find(a => a.name === key); // TODO loop depth
	if (!prop) return [];
	if (XmlAttributeWithEnumType.typeIsEnum(prop)) {
		return XmlAttributeWithEnumType.getEnum(prop).map(value => {
			return new CompletionString(value);
		});
	}
	return [];
}

class AutoComplete {
	constructor(private _documentRules: XmlDocumentRules) {

	}

	autoCompleteAttributeName(
		token: AmlParsing.Model.Aml.AtributeNameToken): CompletionInfos | undefined {
		const element = this._documentRules.getElement(antiCapitalize(token.context.tag));
		if (!element) {
			return {
				scope: XmlEditionType.ATTRIBUTE_NAME,
				completionStrings: []
			};
		}
		return {
			scope: XmlEditionType.ATTRIBUTE_NAME,
			completionStrings: element.attributes.map(attribute => {
				return new CompletionString(attribute.name, attribute.comment);
			})
		};
	}

	autoCompleteTag(token: AmlParsing.Model.Aml.TagToken): CompletionInfos | undefined {
		return {
			scope: XmlEditionType.TAG,
			completionStrings: this._documentRules.elements.map(element => {
				// TODO filter following the parent tag
				return new CompletionString(capitalize(element.name), element.comment);
			})
		};
	}

	autoCompleteAttributeValue(token: AmlParsing.Model.Aml.AttributeValueToken): CompletionInfos | undefined {
		if (!token.content) {
			return {
				scope: XmlEditionType.ATTRIBUTE_VALUE,
				completionStrings: getAttributeValueCompletion(this._documentRules, token.context)
			};
		}
		if (token.content instanceof AmlParsing.Model.Json.ObjectTokensList) {
			// TODO
		} else if (token.content instanceof AmlParsing.Model.Expression.ExpressionTokensList) {
			// TODO
			console.log('autocomplete expression', token.tokenUnit.text);
		}
	}
}
