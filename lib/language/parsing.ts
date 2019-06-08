import { PropertyType, SimpleType, ComplexType } from "./types";
import { XmlAttribute } from "../types/document-rules";

export function isSimpleType(data: PropertyType): data is SimpleType {
	return typeof data === 'string';
}

export function isComplexType(data: PropertyType): data is ComplexType {
	return typeof data === 'object';
}

export function parseXmlAttribute(attributeName: string, attributeValue: PropertyType): XmlAttribute {
	if (isSimpleType(attributeValue)) {
		return new XmlAttribute(attributeName, attributeValue);
	} else if (isComplexType(attributeValue)) {
		const subAttributes = Object.keys(attributeValue).map(subAttributeName => {
			const subAttributeValue = attributeValue[subAttributeName];
			return parseXmlAttribute(subAttributeName, subAttributeValue);
		});
		return new XmlAttribute(attributeName, subAttributes);
	} else { // enum
		return new XmlAttribute(attributeName, attributeValue);
	}
}
