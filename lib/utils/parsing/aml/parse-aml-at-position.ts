import { XmlEditionInContext, XmlTagEdition, XmlAttributeNameEdition, XmlAttributeValueEdition } from '../types/xml-edition';
import { AMLParser } from './aml-parser';
import { IAmlParsingResult, ParsingType } from './types/aml-parsing-result';
import { XmlNode } from '../types/xml-node';

/**
 * function which gives info about where is the cursor
 */
export function getAmlScopeForPosition(amlContent: string, offset: number):
	XmlEditionInContext | undefined {
	const parser = new AMLParser(amlContent);
	parser.parse();
	const res = parser.parsingResults.getParsingElement(offset);
	if (!res) return undefined;
	const index = parser.parsingResults.indexOf(res);
	const parentNodes = parser.parsingResults.getContext(offset);
	switch (res.parsingType) {
		case ParsingType.OPEN_TAG:
			return {
				edition: new XmlTagEdition({
					tag: res.detail.getTextAtOffset(offset)
				}),
				parents: parentNodes
			};
		case ParsingType.ATTRIBUTE_NAME:
			const tagParsing = parser.parsingResults.trunc(index).getLastElementOfType(ParsingType.OPEN_TAG);
			if (!tagParsing) return undefined;
			return {
				edition: new XmlAttributeNameEdition({
					tag: tagParsing.detail.tag,
					attributeName: res.detail.getTextAtOffset(offset)
				}),
				parents: parentNodes
			};
		case ParsingType.ATTRIBUTE_VALUE:
			const attributeNameParsing = <IAmlParsingResult<ParsingType.ATTRIBUTE_NAME>>parser.parsingResults[index - 1];
			const tagParsing2 = parser.parsingResults.trunc(index).getLastElementOfType(ParsingType.OPEN_TAG);
			if (!tagParsing2) return undefined;
			return {
				edition: new XmlAttributeValueEdition({
					tag: tagParsing2.detail.tag,
					attributeName: attributeNameParsing.detail.attributeName,
					attributeValue: res.detail.getTextAtOffset(offset)
				}),
				parents: parentNodes
			};
	}
	return undefined;
}
