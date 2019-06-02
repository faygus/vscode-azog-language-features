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
}

export class XmlElement {
	name: string;
	attributes: XmlAttribute[];

	constructor(name: string, attributes?: XmlAttribute[]) {
		this.name = name;
		this.attributes = attributes ? attributes : [];
	}
}

export class XmlAttribute {
	name: string;
	type: string;

	constructor(name: string, type: string) {
		this.name = name;
		this.type = type;
	}
}
