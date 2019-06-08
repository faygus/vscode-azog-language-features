import { ITagsDefinitions } from "../types";
import { controlWFStyle } from "./attributes";

export const tags: ITagsDefinitions = {

	'labelWF': {
		attributes: {
			'text': 'string',
			'style': controlWFStyle
		}
	},

	'iconWF': {
		attributes: {
			'iconName': 'string',
			'style': controlWFStyle
		}
	}
}
