import { ITagsDefinitions } from "./types";
import { XmlDocumentRules, XmlElement } from "../types/document-rules";
import { parseXmlAttribute } from "./parsing";

export class XmlDocumentRulesFactory {
	static build(data: ITagsDefinitions): XmlDocumentRules {
		const documentRules = new XmlDocumentRules();

		const xmlElements = Object.keys(data).map(tagName => {
			const tagValue = data[tagName];
			const xmlElement = new XmlElement(tagName);
			xmlElement.comment = tagValue.comment;
			const xmlAttributes = Object.keys(tagValue.attributes).map(attributeName => {
				const attributeValue = tagValue.attributes[attributeName];
				return parseXmlAttribute(attributeName, attributeValue);
			});
			xmlElement.attributes = xmlAttributes;
			return xmlElement;
		});
		documentRules.elements = xmlElements;
		return documentRules;
	}
}
