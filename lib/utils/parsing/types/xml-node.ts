import { DataStack } from "../../data-stack";

export class XmlDepthPath extends DataStack<XmlNode> {

	/**
	 * returns false if the closing tag doesn't match the current opened tag
	 */
	closeTag(tagName: string): boolean {
		if (this.length === 0) {
			return false;
		}
		if (this.slice().reverse()[0].tag !== tagName) {
			return false;
		}
		this.pop();
		return true;
	}

	hasTagsOpened(): boolean {
		return this.length > 0;
	}
}

export class XmlNode {
	tag: string;
	attributes: { [key: string]: string } = {};

	constructor(tag: string, attributes?: { [key: string]: string }) {
		this.tag = tag;
		if (attributes) {
			this.attributes = attributes;
		}
	}
}
