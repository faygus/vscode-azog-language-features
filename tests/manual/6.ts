import { xmlToAzog } from "../../lib/interpreter/xml-to-azog";

export async function run() {
	const xml = `<IconWF iconName="female">
	<IconWF.style size="Small"/>
</IconWF>`;
	xmlToAzog(xml).then(res => {
		console.log('res', res);
	}, err => {
		console.error(err.message);
	});
}
