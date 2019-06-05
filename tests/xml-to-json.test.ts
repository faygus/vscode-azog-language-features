import { expect } from "chai";
import { xmlToJSON } from "../lib/interpreter/xml-to-json";

const xml = `<LabelWF text="hey man">
</LabelWF>`;

describe('XML to json', () => {
	it('should convert xml to JSON', async () => {
		const data = await xmlToJSON(xml);
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

/*

		const expected = {
			type: "labelWF",
			value: {
				text: "hey man"
			}
		};
		*/