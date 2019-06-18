import { CompletionString } from '../../../types';
import { XmlDocumentRules, XmlAttributeWithEnumType } from '../../../types/document-rules';
import { getScopeForPosition } from '../../../utils/parsing/parse-at-position';
import { XmlAttributeNameEdition, XmlAttributeValueEdition, XmlTagEdition, XmlEditionType } from '../../../utils/parsing/types';
import { antiCapitalize, capitalize } from '../../../utils/string-utils';

interface CompletionInfos {
	scope: XmlEditionType;
	completionStrings: CompletionString[];
}

export async function computeCompletion(documentContent: string, offset: number,
	documentRules: XmlDocumentRules): Promise<CompletionInfos | undefined> {
	const xmlEdition = await getScopeForPosition(documentContent, offset);
	if (xmlEdition.edition === undefined) {
		return undefined;
	}
	if (xmlEdition.edition instanceof XmlTagEdition) {
		return {
			scope: XmlEditionType.TAG,
			completionStrings: documentRules.elements.map(element => {
				// TODO filter following the parent tag
				return new CompletionString(capitalize(element.name), element.comment);
			})
		}
	}
	if (xmlEdition.edition instanceof XmlAttributeNameEdition) {
		const element = documentRules.getElement(antiCapitalize(xmlEdition.edition.tag));
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
		}
	}
	if (xmlEdition.edition instanceof XmlAttributeValueEdition) {
		return {
			scope: XmlEditionType.ATTRIBUTE_VALUE,
			completionStrings: getAttributeValueCompletion(documentRules, xmlEdition.edition)
		};
	}
	console.warn('xml edition has no type');
	return undefined;
}

function getAttributeValueCompletion(documentRules: XmlDocumentRules,
	xmlEdition: XmlAttributeValueEdition): CompletionString[] {
	const element = documentRules.getElement(antiCapitalize(xmlEdition.tag));
	if (!element) {
		console.warn(`no element ${xmlEdition.tag}`);
		return [];
	}

	const attribute = element.attributes.find(a => a.name === xmlEdition.attributeName);
	if (!attribute) {
		console.warn(`no attribute ${xmlEdition.attributeName} in ${xmlEdition.tag}`);
		return [];
	}
	if (XmlAttributeWithEnumType.typeIsEnum(attribute)) {
		return XmlAttributeWithEnumType.getEnum(attribute).map(value => {
			return new CompletionString(value);
		});
	}
	return [];
}
