import { XmlNode } from "../xml-parsing";

export interface XmlTagEdition {
	tag: string;
}

export interface XmlAttributeNameEdition {
	tag: string;
	attributeName: string;
}

export interface XmlAttributeValueEdition {
	tag: string;
	attributeName: string;
	attributeValue: string;
}

export interface XmlTextEdition {
	text: string;
}

export enum XmlEditionType {
	TAG,
	ATTRIBUTE_NAME,
	ATTRIBUTE_VALUE,
	TEXT
}

export interface EdtionTypeMapping {
	[XmlEditionType.TAG]: XmlTagEdition;
	[XmlEditionType.ATTRIBUTE_NAME]: XmlAttributeNameEdition;
	[XmlEditionType.ATTRIBUTE_VALUE]: XmlAttributeValueEdition;
	[XmlEditionType.TEXT]: XmlTextEdition;
}

export type XmlEdition<T extends XmlEditionType> = EdtionTypeMapping[T];

export type AnyXmlEdition = XmlEdition<XmlEditionType>;

export type XmlEditionInDepth = {
	edition: AnyXmlEdition | undefined,
	parents: XmlNode[];
}
