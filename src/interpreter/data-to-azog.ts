import { IJsonData } from "../types/json-data";

export function dataToAzog(data: IJsonData): any {
	const viewType = convertXmlTagToJsonKey(data.tag);
	const res = {
		type: viewType,
		value: {
			...data.attributes // TODO
		}
	};
	return res;
	/*for (const child of data.children) {
		dataToAzog(child);
	}*/
}

/**
 * example : convert LabelWF to labelWF
 */
function convertXmlTagToJsonKey(tag: string): string {
	return tag.charAt(0).toLowerCase() + tag.slice(1)
}
