import { xmlToAzog } from "../../lib/interpreter/xml-to-azog";

const xml = `<LabelWF text="hey man">
		<LabelWF.Style color="red"></LabelWF.Style>
</LabelWF>`;

xmlToAzog(xml).then(azog => {
	console.log(azog);
});
