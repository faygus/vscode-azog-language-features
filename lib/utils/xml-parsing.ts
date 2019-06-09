import { DataStack } from "./data-stack";

export class XmlDepthPath extends DataStack<XmlNode> {

}

export class XmlNode {
	tag: string;
	attributes: { [key: string]: string };

	constructor(tag: string, attributes: { [key: string]: string }) {
		this.tag = tag;
		this.attributes = attributes;
	}
}
