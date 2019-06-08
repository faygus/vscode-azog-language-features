import { IJsonData } from "../types/json-data";
import { antiCapitalize } from "../utils/string-utils";

export function dataToAzog(data: IJsonData): any {
	const viewType = convertXmlTagToJsonKey(data.tag);
	const res: any = {
		type: viewType,
		value: {
			...data.attributes // TODO
		}
	};
	for (const child of data.children) {
		const tagSplitted = child.tag.split('.');
		if (tagSplitted.length > 0 && tagSplitted[0] === data.tag) {
			const attributeName = convertXmlTagToJsonKey(tagSplitted.slice(1).join('.'));
			res.value[attributeName] = {
				...child.attributes
			};
		} else {
			// dataToAzog(child); // TODO
		}
	}
	return res;
}

/**
 * example : convert LabelWF to labelWF
 */
function convertXmlTagToJsonKey(tag: string): string {
	return antiCapitalize(tag);
}
