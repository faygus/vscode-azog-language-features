import { ITagsDefinitions } from "../types";
import { controlWFStyle } from "./attributes";

export const tags: ITagsDefinitions = {

	'labelWF': {
		comment: 'shows a basic text control for wireframe interface',
		attributes: {
			'text': {
				type: 'string',
				comment: 'value of the text'
			},
			'style': {
				type: controlWFStyle,
				comment: 'style of the text'
			}
		},
	},

	'iconWF': {
		comment: 'shows a basic icon control for wireframe interface',
		attributes: {
			'iconName': {
				type: 'string',
				comment: 'icon'
			},
			'style': {
				type: controlWFStyle,
				comment: 'style of the icon'
			}
		}
	}
}
