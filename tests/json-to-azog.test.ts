import { expect } from "chai";
import { dataToAzog } from "../lib/interpreter/data-to-azog";
import { IJsonData } from "../lib/types/json-data";

const json: IJsonData = {
	tag: 'LabelWF',
	attributes: {
		text: 'hey man'
	},
	children: []
};

describe('json to azog', () => {
	it('should convert json to azog', async () => {
		const data = dataToAzog(json);
		const expected = {
			type: 'labelWF',
			value: {
				text: 'hey man'
			}
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});
});
