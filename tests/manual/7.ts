import { xmlToJSON } from "../../lib/interpreter/xml-to-json";

export async function run() {
	/*const xml = `<Label style="{
	color: 'red'
}"/>`;
	const res = await xmlToJSON(xml);
	console.log('res', res);*/

	const data = `{
		color: 'Gray',
		size: 'Small'
	}`;
	const res = parseJsonString(data);
	console.log('res', res);
};

function parseJsonString(data: string): any {
	const correctJson = data.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2":') // add "" for keys
		.replace(/: '([a-z0-9A-Z_ ]+)'([,$])?/g, ': "$1"$2'); // replace '' by "" for values
	console.log('correctJson', correctJson);
	return JSON.parse(correctJson);
}
