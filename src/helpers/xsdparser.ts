import { XmlTagCollection, CompletionString } from '../types';

export default class XsdParser {

	/**
	 * reads a xsd file and extracts all its informations
	 */
	public static getSchemaTagsAndAttributes(xsdContent: string): Promise<XmlTagCollection> {
		const sax = require("sax");
		const parser = sax.parser(true);

		return new Promise<XmlTagCollection>(
			(resolve) => {
				let result: XmlTagCollection = new XmlTagCollection();
				let xmlDepthPath = new XmlDepthPath();

				parser.onopentag = (tagData: { name: string, isSelfClosing: boolean, attributes: Map<string, string> }) => {
					const name = tagData.attributes["name"];
					const tag = tagData.name;
					const node = new XmlNode(tag, name, tagData.attributes);
					if (node.type === XsdElementType.ELEMENT && name !== undefined) {
						result.push({
							tag: new CompletionString(name),
							base: [tagData.attributes["type"]],
							attributes: [],
							visible: true
						});
					}

					/*if (tag.endsWith(":complexType") && name !== undefined) {
						result.push({
							tag: new CompletionString(name),
							base: [],
							attributes: [],
							visible: false
						});
					}*/

					/*if (tag.endsWith(":attributeGroup") && name !== undefined) {
						result.push({
							tag: new CompletionString(name),
							base: [],
							attributes: [],
							visible: false
						});
					}*/

					if (node.type === XsdElementType.ATTRIBUTE && node.name !== undefined) {
						let currentResultTag = xmlDepthPath.getFirstParentNodeWithName();
						if (currentResultTag !== undefined) {
							const res = result.find(e => e.tag.name === (<XmlNode>currentResultTag).name);
							if (res) {
								res.attributes.push(new CompletionString(node.name));
							}
						}
						// TODO tagData.attributes["type"] and tagData.attributes["use"]
					}

					/*if (tag.endsWith(":extension") && tagData.attributes["base"] !== undefined) {
						let currentResultTag = xmlDepthPath
							.slice()
							.reverse()
							.find(e => e.name !== undefined);
						if (currentResultTag !== undefined) {
							result
								.filter(e => e.tag.name === currentResultTag.name)
								.forEach(e => e.base.push(tagData.attributes["base"]));
						}
					}*/

					/*if (tag.endsWith(":attributeGroup") && tagData.attributes["ref"] !== undefined) {
						let currentResultTag = xmlDepthPath
							.slice()
							.reverse()
							.filter(e => e.name !== undefined)[0];

						result
							.filter(e => e.tag.name === currentResultTag.name)
							.forEach(e => e.base.push(tagData.attributes["ref"]));
					}*/

					if (tag.endsWith(":import") && tagData.attributes["schemaLocation"] !== undefined) {
						// TODO: handle this somehow, possibly separate methood to be called:
						// importFiles.push(tagData.attributes["schemaLocation"]);
					}
					xmlDepthPath.push(node);
				};

				parser.onclosetag = (name: string) => {
					let popped = xmlDepthPath.pop();
					if (popped === undefined || popped.tag !== name) {
						console.warn("XSD open/close tag consistency error.");
						return;
					}
					if (popped.type === XsdElementType.ELEMENT) {
						// TODO add to results
					}
				};

				parser.ontext = (t: string) => {
					processComment(t, xmlDepthPath);
					/*if (/\S/.test(t)) {
						let stack = xmlDepthPath
							.slice()
							.reverse();

						if (!stack.find(e => e.tag.endsWith(":documentation"))) {
							return;
						}

						let currentCommentTarget =
							stack
								.filter(e => e.resultTagName !== undefined)[0];

						if (!currentCommentTarget) {
							return;
						}

						if (currentCommentTarget.tag.endsWith(":element")) {
							result
								.filter(e => e.tag.name === currentCommentTarget.resultTagName)
								.forEach(e => e.tag.comment = t.trim());
						}
						else if (currentCommentTarget.tag.endsWith(":attribute")) {
							result
								.map(e => e.attributes)
								.reduce((prev, next) => prev.concat(next), [])
								.filter(e => e.name === currentCommentTarget.resultTagName)
								.forEach(e => e.comment = t.trim());
						}
					}*/
				};

				parser.onend = () => {
					if (xmlDepthPath.length !== 0) {
						console.warn("XSD open/close tag consistency error (end).");
					}

					resolve(result);
				};

				parser.write(xsdContent).close();
			});
	}
}

function processComment(t: string, xmlDepthPath: XmlDepthPath): void {
	if (!/\S/.test(t)) {
		return;
	}
	let stack = xmlDepthPath
		.slice()
		.reverse();
	if (!stack.find(e => e.tag.endsWith(":documentation"))) {
		return;
	}
	const currentCommentTarget = xmlDepthPath.getFirstParentNodeWithName();
	if (!currentCommentTarget) {
		return;
	}
	// const comment = t.trim();
	// TODO
}

function getXsdElementType(tag: string): XsdElementType {
	for (const pattern in xsdElementTypeMap) {
		if (tag.endsWith(`:${pattern}`)) {
			return xsdElementTypeMap[pattern];
		}
	}
	return XsdElementType.UNKOWN;
}

enum XsdElementType {
	UNKOWN,
	ELEMENT,
	ATTRIBUTE,
	COMPLEX_TYPE
	// ...
}

const xsdElementTypeMap = {
	"element": XsdElementType.ELEMENT,
	"complexType": XsdElementType.COMPLEX_TYPE,
	"attribute": XsdElementType.ATTRIBUTE
}

class XmlDepthPath extends Array<XmlNode> {
	getFirstParentNodeWithName(): XmlNode | undefined {
		const res = this.slice()
			.reverse()
			.find(e => e.name !== undefined);
		return res;
	}
}

class XmlNode {
	tag: string;
	name: string;
	attributes: Map<string, string>;

	constructor(tag: string, name: string, attributes: Map<string, string>) {
		this.tag = tag;
		this.name = name;
		this.attributes = attributes;
	}

	get type(): XsdElementType {
		return getXsdElementType(this.tag);
	}
}
