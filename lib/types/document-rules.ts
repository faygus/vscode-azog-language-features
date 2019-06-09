import { SimpleType, EnumType } from "../language/types";

export class XmlDocumentRules {
	elements: XmlElement[] = [];

	hasElement(name: string): boolean {
		return this.elements.findIndex(e => e.name === name) >= 0;
	}

	getAllAttributes(name: string): XmlAttribute[] {
		const element = this.elements.find(e => e.name === name);
		if (element) {
			return element.attributes;
		}
		return [];
	}

	getElement(name: string): XmlElement | undefined {
		return this.elements.find(e => e.name === name);
	}
}

export class XmlElement {
	name: string;
	comment?: string;
	attributes: XmlAttribute[];

	constructor(name: string, attributes?: XmlAttribute[]) {
		this.name = name;
		this.attributes = attributes ? attributes : [];
	}

	hasAttribute(attributeName: string): boolean {
		return this.attributes.findIndex(a => a.name === attributeName) >= 0;
	}

	getAttribute(attributeName: string): XmlAttribute | undefined {
		return this.attributes.find(a => a.name === attributeName);
	}
}

export class XmlAttribute {
	name: string;
	type: SimpleType | EnumType | XmlAttribute[];
	comment?: string;

	constructor(name: string, subAttributes: XmlAttribute[]);
	constructor(name: string, type: SimpleType);
	constructor(name: string, type: EnumType);
	constructor(name: string, type: SimpleType | EnumType | XmlAttribute[]) {
		this.name = name;
		this.type = type;
	}

	getAllSubAttributes(): XmlAttribute[] {
		if (Array.isArray(this.type)) {
			return <XmlAttribute[]>this.type;
		}
		return [];
	}
}
