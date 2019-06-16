import { expect } from "chai";
import { computeCompletion } from "../lib/features/completion/compute";
import { CompletionString } from "../lib/types";
import { capitalize } from "../lib/utils/string-utils";
import { mockDocumentRules, mockTags } from "./utils/fake-rules";

describe('completion', () => {
	it('should suggest attributes of label tag', async () => {
		const xml = `<Label text="hey"/>`;
		const offset = 9;
		const res = await computeCompletion(xml, offset, mockDocumentRules);
		const attributes = mockTags['label'].attributes;
		const expected = Object.keys(attributes).map(key => {
			return new CompletionString(key, attributes[key].comment);
		});
		expect(JSON.stringify(res.completionStrings)).to.equal(JSON.stringify(expected));
	});

	it('should suggest tags', async () => {
		const xml = `<Label text="hey"/>`;
		const offset = 4;
		const res = await computeCompletion(xml, offset, mockDocumentRules);
		const expected = Object.keys(mockTags).map(key => {
			return new CompletionString(capitalize(key), mockTags[key].comment);
		});
		expect(JSON.stringify(res.completionStrings)).to.equal(JSON.stringify(expected));
	});

	it('should suggest enum for attribute', async () => {
		const xml = `<Label color="green"/>`;
		const offset = 17;
		const res = await computeCompletion(xml, offset, mockDocumentRules);
		const values = mockTags['label'].attributes['color'].type;
		expect(Array.isArray(values)).to.equal(true);
		const expected = (<Array<string>>values).map(value => {
			return new CompletionString(value);
		});
		expect(JSON.stringify(res.completionStrings)).to.equal(JSON.stringify(expected));
	});
});
