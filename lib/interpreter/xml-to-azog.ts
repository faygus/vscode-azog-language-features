import { xmlToJSON } from "./xml-to-json";
import { jsonToAzog } from "./json-to-azog";
import documentRules from "../language/language-specifications";

export async function xmlToAzog(xml: string): Promise<any> {
	const json = await xmlToJSON(xml);
	if (!json) return undefined;
	const azogApp = jsonToAzog(json, documentRules);
	return azogApp;
}
