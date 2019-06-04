import { IJsonData } from "../types/json-data";
import * as sax from 'sax';

export function xmlToJSON(xml: string): Promise<IJsonData> {
	const parser = sax.parser(true);
	return new Promise<IJsonData>(
		(resolve) => {
			let result: IJsonData;
			const loopList: IJsonData[] = [];

			parser.onerror = () => {
				parser.resume();
			};

			/*parser.ontext = (_t: any) => {
			};*/

			parser.onopentag = (tag) => {
				let node: IJsonData = {
					tag: tag.name,
					attributes: <any>tag.attributes, // TODO
					children: []
				};
				if (loopList.length > 0) {
					loopList[loopList.length - 1].children.push(node);
				} else {
					result = node;
				}
				loopList.push(node);
			};

			/*parser.onattribute = () => {
			};*/

			parser.onclosetag = () => {
				loopList.pop();
			};

			parser.onend = () => {
				resolve(result);
			};

			parser.write(xml).close();
		});
}
