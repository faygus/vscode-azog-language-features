import { expect } from "chai";
import { AMLParser } from "../lib/utils/parsing/aml/aml-parser";
import { AmlParsingResults, ParsingType } from "../lib/utils/parsing/aml/aml-parsing-result";

describe('AmlParser', () => {
	it('should parse single line tag with attribute', () => {
		const xml = `<Label text="hey"/>`;
		const parser = new AMLParser();
		const messages = parser.parse(xml);
		const expected = new AmlParsingResults([{
			parsingType: ParsingType.OPEN_TAG,
			detail: {
				tag: 'Label',
				offset: 6
			}
		},
		{
			parsingType: ParsingType.ATTRIBUTE_NAME,
			detail: {
				attributeName: 'text',
				offset: 11
			}
		},
		{
			parsingType: ParsingType.ATTRIBUTE_VALUE,
			detail: {
				attributeValue: 'hey',
				offset: 16
			}
		}]);
		expect(JSON.stringify(messages)).to.equal(JSON.stringify(expected));
	});
});
