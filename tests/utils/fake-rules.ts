import { XmlDocumentRulesFactory } from "../../lib/language/rules-builder";
import { ITagsDefinitions } from "../../lib/language/types";

export const mockTags: ITagsDefinitions = {
	'label': {
		comment: 'shows a basic text control for wireframe interface',
		attributes: {
			'text': {
				type: 'string',
				comment: 'value of the text'
			},
			'color': {
				type: ['red', 'green', 'blue'],
				comment: 'color of the text'
			}
		},
	},
	'icon': {
		comment: 'shows a basic icon control for wireframe interface',
		attributes: {
			'iconName': {
				type: 'string',
				comment: 'icon'
			}
		}
	}
};

export const mockDocumentRules = XmlDocumentRulesFactory.build(mockTags);