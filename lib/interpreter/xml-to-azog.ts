import { xmlToJSON } from "./xml-to-json";
import { dataToAzog } from "./data-to-azog";

export async function xmlToAzog(xml: string): Promise<any> {
	const json = await xmlToJSON(xml);
	if (!json) return undefined;
	const azogApp = dataToAzog(json);
	return azogApp;
}
