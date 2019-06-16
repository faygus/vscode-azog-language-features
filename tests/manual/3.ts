import { computeCompletion } from "../../lib/features/completion/compute";
import { ITagsDefinitions } from "../../lib/language/types";
import { XmlDocumentRulesFactory } from "../../lib/language/rules-builder";

export async function run() {
	const tags: ITagsDefinitions = {
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

	const documentRules = XmlDocumentRulesFactory.build(tags);

	const xml = `<Label color="green"/>`;
	const offset = 17;
	const res = await computeCompletion(xml, offset, documentRules);
	console.log('res', res);
	// const values = tags['label'].attributes['color'].type;
}
