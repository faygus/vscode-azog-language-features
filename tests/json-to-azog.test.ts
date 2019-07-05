import { expect } from "chai";
import { jsonToAzog } from "../lib/interpreter/json-to-azog";
import { mockDocumentRules } from "./utils/fake-rules";
import * as AmlParsing from "aml-parsing";

describe('json to azog', () => {
	it('should convert green to 1', async () => {
		const json: AmlParsing.AmlInterpretation = {
			tag: 'Label',
			attributes: {
				color: 'green'
			},
			children: []
		};
		const data = jsonToAzog(json, mockDocumentRules);
		const expected = {
			type: 'label',
			value: {
				color: 1
			}
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});

	it('should convert red to 0', async () => {
		const json: AmlParsing.AmlInterpretation = {
			tag: 'Label',
			attributes: {
				color: 'red'
			},
			children: []
		};
		const data = jsonToAzog(json, mockDocumentRules);
		const expected = {
			type: 'label',
			value: {
				color: 0
			}
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});

	it('should convert blue to 2', async () => {
		const json: AmlParsing.AmlInterpretation = {
			tag: 'Label',
			attributes: {
				color: 'blue'
			},
			children: []
		};
		const data = jsonToAzog(json, mockDocumentRules);
		const expected = {
			type: 'label',
			value: {
				color: 2
			}
		};
		expect(JSON.stringify(data)).to.equal(JSON.stringify(expected));
	});
});
