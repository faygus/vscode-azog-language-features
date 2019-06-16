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
			'color': {
				type: ['red', 'green', 'blue', 'orange', 'yellow', 'brown', 'black', 'white', 'purple'],
				comment: 'color that you want bro'
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
				type: ['calendar', 'user', 'female', 'users', 'dashboard'],
				comment: 'icon'
			},
			'style': {
				type: controlWFStyle,
				comment: 'style of the icon'
			}
		}
	}
}
