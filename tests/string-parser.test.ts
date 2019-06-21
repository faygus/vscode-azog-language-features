import { expect } from "chai";
import { StringParser } from "../lib/utils/parsing/aml/aml-parser";

describe('String parser', () => {
	it('should navigate to last non empty character', () => {
		const str = 'Hey man     ';
		const parser = new StringParser(str);
		parser.navigateToLastNonEmptyChar();
		expect(parser.offset).to.equal(6);
	});
});
