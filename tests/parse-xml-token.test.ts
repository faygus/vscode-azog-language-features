import { expect } from "chai";
import { getScopeForPosition } from '../lib/utils/parsing/parse-at-position';
import { XmlTextEdition, XmlTagEdition, XmlAttributeValueEdition } from "../lib/utils/parsing/types";

describe('getScopeForPosition', () => {
	it('should return text', async () => {
		const xml = `<Foo bar="hello world">Hello</Foo>`;
		const offset = 27;
		const res = await getScopeForPosition(xml, offset);
		const expected = new XmlTextEdition({
			text: 'Hell'
		});
		expect(JSON.stringify(res.edition)).to.equal(JSON.stringify(expected));
	});

	it('should return element', async () => {
		const xml = `<Foo bar="hello world">
	Hello
</Foo>`;
		const offset = 3;
		const res = await getScopeForPosition(xml, offset);
		const expected = new XmlTagEdition({
			tag: 'Fo'
		});
		expect(JSON.stringify(res.edition)).to.equal(JSON.stringify(expected));
	});

	it('should return attribute', async () => {
		const xml = `<Foo bar="hello world">
	Hello
</Foo>`;
		const offset = 11;
		const res = await getScopeForPosition(xml, offset);
		const expected = new XmlAttributeValueEdition({
			tag: 'Foo',
			attributeName: 'bar',
			attributeValue: 'h'
		});
		expect(JSON.stringify(res.edition)).to.equal(JSON.stringify(expected));
	});
});
