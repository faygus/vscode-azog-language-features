import * as sax from 'sax';
import { XmlDepthPath, XmlNode } from '../xml-parsing';
import { AnyXmlEdition, XmlAttributeNameEdition, XmlAttributeValueEdition, XmlEditionInDepth, XmlTagEdition, XmlTextEdition } from './types';

/**
 * function which gives info about where is the cursor
 */
export function getScopeForPosition(xmlContent: string, offset: number): Promise<XmlEditionInDepth> {
	// TODO do not use sax but AmlParser
	const parser = sax.parser(true);
	const parse = () => {
		return parseAtPosition(xmlContent, offset, parser.position);
	};
	return new Promise<XmlEditionInDepth>(
		(resolve) => {
			const path = new XmlDepthPath();
			let result: XmlEditionInDepth | undefined;

			parser.onerror = () => {
				parser.resume();
				if (result) {
					return;
				}
				const edition = parse();
				if (!edition) {
					return;
				}
				result = {
					edition,
					parents: path.slice()
				};
			};

			parser.onopentag = (tag: sax.Tag) => {
				if (result) {
					return;
				}
				const edition = parse();
				if (!edition) {
					const element = new XmlNode(tag.name, tag.attributes);
					path.push(element);
					return;
				}
				result = {
					edition,
					parents: path.slice()
				};
			};

			parser.onclosetag = () => {
				if (result) {
					return;
				}
				const edition = parse();
				if (!edition) {
					return;
				}
				result = {
					edition,
					parents: path.slice()
				};
				path.pop();
			};

			parser.onend = () => {
				resolve(result);
			};

			parser.write(xmlContent).close();
		});
}

function parseAtPosition(xmlContent: string, offset: number,
	currentPosition: number): AnyXmlEdition | undefined {

	if (currentPosition < offset) {
		return undefined;
	}
	let contentToAnalyse = xmlContent.substring(0, offset);
	const lastOpeningBracketIndex = contentToAnalyse.lastIndexOf('<');
	contentToAnalyse = lastOpeningBracketIndex >= 0 ?
		contentToAnalyse.substring(lastOpeningBracketIndex) : contentToAnalyse;

	let normalizedContent = contentToAnalyse.trim()
		.replace(/\//g, '').replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ')
		.split('=').map(e => e.trim()).join('=') // remove spaces around '='
		.split(' ').filter(e => e.length).join(' ') // remove useless spaces
		.substring(1); // remove <
	const endOfTag = normalizedContent.indexOf(' ');
	const onlyTag = endOfTag < 0;
	let tagName = onlyTag ? normalizedContent :
		normalizedContent.substring(0, endOfTag);
	// const validTagName = /^[a-z0-9\.-_]*$/.test(tagName) ? tagName : undefined;
	if (onlyTag) {
		const res = new XmlTagEdition({
			tag: tagName
		});
		return res;
	}
	if (normalizedContent.indexOf('>') < 0) { // edition of an attribute
		const attributesLine = normalizedContent.substring(endOfTag + 1);
		const res = parseAttributes(tagName, attributesLine);
		return res;
	}
	if (contentToAnalyse.lastIndexOf('>') >= contentToAnalyse.lastIndexOf('<')) {
		const text = contentToAnalyse.substring(contentToAnalyse.lastIndexOf('>') + 1);
		const res = new XmlTextEdition({
			text
		});
		return res;
	}
};

function parseAttributes(tag: string, attributesLine: string): XmlAttributeNameEdition |
	XmlAttributeValueEdition | undefined {
	const attributes = attributesLine.split(' ');
	if (attributes.length === 0) {
		return undefined;
	}
	const lastAttribute = attributes.reverse()[0];
	const array = lastAttribute.split('=');
	const attributeName = array[0];
	if (array.length === 1) {
		const res = new XmlAttributeNameEdition({
			tag,
			attributeName
		});
		return res;
	}
	let attributeValue = array[1];
	if (attributeValue) {
		if (attributeValue[0] !== '"') {
			throw new Error('attribute not valid');
		}
		attributeValue = attributeValue.substring(1);
		if (attributeValue.indexOf('"') >= 0) { // attribue value between ""
			return undefined; // TODO check if '\"' pattern
		}
		const res = new XmlAttributeValueEdition({
			tag,
			attributeName,
			attributeValue
		});
		return res;
	}
}
