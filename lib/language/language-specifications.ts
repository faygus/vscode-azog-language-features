import { XmlDocumentRules, XmlElement } from "../types/document-rules";
import { parseXmlAttribute } from "./parsing";
import { tags } from "./resources/tags";

/**
 * Specifies all the tags which can be used in the azog language
 */
const documentRules = new XmlDocumentRules();

const xmlElements = Object.keys(tags).map(tagName => {
	const tagValue = tags[tagName];
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

export default documentRules;
