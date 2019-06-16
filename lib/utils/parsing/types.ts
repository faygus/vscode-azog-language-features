import { XmlNode } from "../xml-parsing";

export class XmlTagEdition {
	tag: string;

	constructor(data: IXmlTagEdition) {
		this.tag = data.tag;
	}
}

export class XmlAttributeNameEdition {
	tag: string;
	attributeName: string;

	constructor(data: IXmlAttributeNameEdition) {
		this.tag = data.tag;
		this.attributeName = data.attributeName;
	}
}

export class XmlAttributeValueEdition {
	tag: string;
	attributeName: string;
	attributeValue: string;

	constructor(data: IXmlAttributeValueEdition) {
		this.tag = data.tag;
		this.attributeName = data.attributeName;
		this.attributeValue = data.attributeValue;
	}
}

export class XmlTextEdition {
	text: string;

	constructor(data: IXmlTextEdition) {
		this.text = data.text;
	}
}

// interfaces

interface IXmlTagEdition {
	tag: string;
}

interface IXmlAttributeNameEdition {
	tag: string;
	attributeName: string;
}

interface IXmlAttributeValueEdition {
	tag: string;
	attributeName: string;
	attributeValue: string;
}

interface IXmlTextEdition {
	text: string;
}

export enum XmlEditionType {
	TAG,
	ATTRIBUTE_NAME,
	ATTRIBUTE_VALUE,
	TEXT
}

export interface IEdtionTypeMapping {
	[XmlEditionType.TAG]: XmlTagEdition;
	[XmlEditionType.ATTRIBUTE_NAME]: XmlAttributeNameEdition;
	[XmlEditionType.ATTRIBUTE_VALUE]: XmlAttributeValueEdition;
	[XmlEditionType.TEXT]: XmlTextEdition;
}

export type XmlEdition<T extends XmlEditionType> = IEdtionTypeMapping[T];

export type AnyXmlEdition = XmlEdition<XmlEditionType>;

export type XmlEditionInDepth = {
	edition: AnyXmlEdition | undefined,
	parents: XmlNode[];
}
