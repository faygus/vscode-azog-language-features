import { PropertyType, SimpleType, ComplexType, ITagAttributeDefinition } from "./types";
import { XmlAttribute } from "../types/document-rules";

export function isSimpleType(data: PropertyType): data is SimpleType {
	return typeof data === 'string';
}

export function isComplexType(data: PropertyType): data is ComplexType {
	return typeof data === 'object';
}

export function parseXmlAttribute(attributeName: string,
	attributeValue: ITagAttributeDefinition): XmlAttribute {
	let res: XmlAttribute;
	const type = attributeValue.type;
	if (isSimpleType(type)) {
		res = new XmlAttribute(attributeName, type);
	} else if (isComplexType(type)) {
		const subAttributes = Object.keys(type).map(subAttributeName => {
			const subAttributeValue = type[subAttributeName];
			const subAttribute = parseXmlAttribute(subAttributeName, subAttributeValue);
			subAttribute.comment = subAttributeValue.comment;
			return subAttribute;
		});
		res = new XmlAttribute(attributeName, subAttributes);
	} else { // enum
		res = new XmlAttribute(attributeName, type);
	}
	res.comment = attributeValue.comment;
	return res;
}
