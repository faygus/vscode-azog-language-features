import { computeCompletion } from "../../lib/features/completion/compute";
import { ITagsDefinitions } from "../../lib/language/types";
import { XmlDocumentRulesFactory } from "../../lib/language/rules-builder";
import { IJsonData } from "../../lib/types/json-data";
import { jsonToAzog } from "../../lib/interpreter/json-to-azog";
import { xmlToAzog } from "../../lib/interpreter/xml-to-azog";

export async function run() {
	const xml = `<LabelWF text="hey man">
	<LabelWFs.Style/>
</LabelWF>`;
	/*const json: IJsonData = {
		tag: 'LabelWF',
		attributes: {
			text: 'hey man',
			color:
		},
		children: []
	};
	const data = jsonToAzog(json);*/
	xmlToAzog(xml).then(res => {
		console.log('res', res);
	}, err => {
		console.error(err.message);
	});
}
