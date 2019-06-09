import { expect } from "chai";
import XmlSimpleParser from "../lib/helpers/xmlsimpleparser";

describe('getScopeForPosition', () => {
	it('should return text', async () => {
		const xml = `<Foo bar="hello world">
	Hello
</Foo>`;
		const offset = 27;
		const res = await XmlSimpleParser.getScopeForPosition(xml, offset);
		expect(res.context).to.equal('text');
		expect(res.tagName).to.equal('Foo');
	});

	it('should return element', async () => {
		const xml = `<Foo bar="hello world">
	Hello
</Foo>`;
		const offset = 3;
		const res = await XmlSimpleParser.getScopeForPosition(xml, offset);
		expect(res.tagName).to.equal('Fo');
		expect(res.context).to.equal('element');
	});

	it('should return attribute', async () => {
		const xml = `<Foo bar="hello world">
	Hello
</Foo>`;
		const offset = 11;
		const res = await XmlSimpleParser.getScopeForPosition(xml, offset);
		expect(res.tagName).to.equal('Foo');
		expect(res.context).to.equal('attribute');
	});
});
