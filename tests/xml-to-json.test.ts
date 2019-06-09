import { expect } from "chai";
import { xmlToJSON, errors } from "../lib/interpreter/xml-to-json";

describe('XML to json', () => {
	it('should convert xml1 to JSON', async () => {
		const xml = `<LabelWF text="hey man">
</LabelWF>`;
		const data = await xmlToJSON(xml);
		const expected = {
			"tag": "labelWF",
			"attributes": {
				"text": "hey man"
			},
			"children": []
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});

	it('should convert xml2 to JSON', async () => {
		const xml = `<LabelWF text="hey man">
	<LabelWF.Style color="red" size="small"/>
</LabelWF>`;
		const data = await xmlToJSON(xml);
		const expected = {
			"tag": "labelWF",
			"attributes": {
				"text": "hey man",
				"style": {
					"color": "red",
					"size": "small"
				}
			},
			"children": []
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});

	it('should emit error of wrapping', async () => {
		const xml = `<LabelWF text="hey man">
	<Foo.Style color="red" size="small"/>
</LabelWF>`;
		let error: Error;
		try {
			const data = await xmlToJSON(xml);
		} catch (err) {
			error = err;
		}
		expect(error).to.exist;
		expect(error.message).to.equal(
			errors.compexAtributeNotWrappedCorrectly('Foo', 'Style').message);
	});

	it('should emit error in tag name', async () => {
		const xml = `<LabelWF text="hey man">
	<LabelWF.Style.Color />
</LabelWF>`;
		let error: Error;
		try {
			const data = await xmlToJSON(xml);
		} catch (err) {
			error = err;
		}
		expect(error).to.exist;
		expect(error.message).to.equal(
			errors.tagNotValid('LabelWF.Style.Color').message);
	});

});

