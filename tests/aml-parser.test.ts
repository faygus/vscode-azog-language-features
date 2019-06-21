import { expect } from "chai";
import { AMLParser } from "../lib/utils/parsing/aml/aml-parser";
import { AmlParsingResults, ParsingType, OpenTagInfos, AttributeNameInfos, AttributeValueInfos } from "../lib/utils/parsing/aml/types/aml-parsing-result";
import { CodeSequence } from "../lib/utils/parsing/aml/types/code-sequence";
import { CodeUnitFactory } from "../lib/utils/parsing/aml/code-unit-factory";

describe('AmlParser', () => {
	it('should parse single line tag with attribute', () => {
		const xml = `<Label text="hey"/>`;
		const parser = new AMLParser(xml);
		const messages = parser.parse();
		const expected = new AmlParsingResults([{
			parsingType: ParsingType.OPEN_TAG,
			detail: new OpenTagInfos(6, 'Label')
		},
		{
			parsingType: ParsingType.ATTRIBUTE_NAME,
			detail: new AttributeNameInfos(11, 'text')
		},
		{
			parsingType: ParsingType.ATTRIBUTE_VALUE,
			detail: new AttributeValueInfos(16, 'hey')
		}]);
		expect(JSON.stringify(messages)).to.equal(JSON.stringify(expected));
	});

	it('should provide code sequence', () => {
		const aml = `<Label text="hey man"/>`;
		const parser = new AMLParser(aml);
		parser.parse();
		const codeSequence = parser.codeSequence;
		const expected = new CodeSequence([
			CodeUnitFactory.createTag(1, 'Label'),
			CodeUnitFactory.createAttributeName(7, 'text'),
			CodeUnitFactory.createAttributeValue(13, 'hey man'),
		]);
		expect(JSON.stringify(codeSequence)).to.equal(JSON.stringify(expected));
	});
});
