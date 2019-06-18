import { xmlToJSON } from "../../lib/interpreter/xml-to-json";

export async function run() {
	const xml = `<Label style="{color: 'red', size: 'small'}" />`;
	const res = await xmlToJSON(xml);
	console.log('res', res);
}
