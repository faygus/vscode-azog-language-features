export class XmlDepthPath extends Array<XmlNode> {
	getFirstParentNode(): XmlNode | undefined {
		if (this.length === 0) return undefined;
		return this.slice().reverse()[0];
	}
}

export class XmlNode {
	tag: string;
	attributes: { [key: string]: string };

	constructor(tag: string, attributes: { [key: string]: string }) {
		this.tag = tag;
		this.attributes = attributes;
	}
}
