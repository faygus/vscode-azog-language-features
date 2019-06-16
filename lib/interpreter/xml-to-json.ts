import { IJsonData, IJsonAttribute, IJsonAttributes } from "../types/json-data";
import * as sax from 'sax';
import { DataStack } from "../utils/data-stack";
import { antiCapitalize } from "../utils/string-utils";

export function xmlToJSON(xml: string): Promise<IJsonData> {
	const parser = sax.parser(true);
	return new Promise<IJsonData>(
		(resolve, reject) => {
			let result: IJsonData;
			const loopList = new DataStack<IJsonData>();

			parser.onerror = () => {
				parser.resume();
			};

			parser.onopentag = (tag: sax.Tag) => { // we guess tag is sax.Tag and not
				// sax.QualifiedTag because xmlns is never set in our use case
				const tagNameSplitted = tag.name.split('.');
				if (tagNameSplitted.length > 2) {
					return reject(errors.tagNotValid(tag.name));
				}
				const parent = loopList.getFirstParentNode();
				if (tagNameSplitted.length === 2) { // TODO remove (no more attribute embeded)
					const controlName = tagNameSplitted[0];
					const attributeName = tagNameSplitted[1];
					if (!parent || parent.tag !== antiCapitalize(controlName)) {
						return reject(errors.compexAtributeNotWrappedCorrectly(controlName,
							attributeName));
					}
					parent.attributes[antiCapitalize(attributeName)] = processAttributes(tag.attributes);
				} else {
					const node: IJsonData = {
						tag: antiCapitalize(tag.name),
						attributes: processAttributes(tag.attributes),
						children: []
					};
					if (parent) {
						parent.children.push(node);
					} else {
						result = node;
					}
					loopList.push(node);
				}
			};

			parser.onclosetag = () => {
				loopList.pop();
			};

			parser.onend = () => {
				resolve(result);
			};

			parser.write(xml).close();
		});
}

function processAttributes(attributes: { [key: string]: string }): IJsonAttributes {
	const res: IJsonAttribute = {};
	for (const attributeName in attributes) {
		const attributeValue = attributes[attributeName];
		if (attributeValue[0] === '{') {
			// TODO parse json object
			try {
				res[attributeName] = parseJsonString(attributeValue);
			} catch (err) {
				throw new Error(`attribute ${attributeName} has an invalid json value`);
			}
		} else {
			res[attributeName] = attributeValue;
		}
	}
	return res;
}

export const errors = {
	tagNotValid: (tag: string) => {
		return new Error(`tag ${tag} is not valid`);
	},
	compexAtributeNotWrappedCorrectly: (tag1: string, tag2: string) => {
		return new Error(`${tag1}.${tag2} should be wrapped in a ${tag1} element`);
	}
};

export function parseJsonString(data: string): any {
	const correctJson = data.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2":') // add "" for keys
		.replace(/: '([a-z0-9A-Z_ ]+)'([,$])?/g, ': "$1"$2'); // replace '' by "" for values
	return JSON.parse(correctJson);
}
