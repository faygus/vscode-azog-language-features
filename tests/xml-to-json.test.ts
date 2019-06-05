import { expect } from "chai";
import { xmlToJSON } from "../lib/interpreter/xml-to-json";

describe('XML to json', () => {
	it('should convert xml1 to JSON', async () => {
		const xml1 = `<LabelWF text="hey man">
</LabelWF>`;
		const data = await xmlToJSON(xml1);
		const expected = {
			"tag": "LabelWF",
			"attributes": {
				"text": "hey man"
			},
			"children": []
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});
});

