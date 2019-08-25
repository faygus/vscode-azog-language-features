import * as AmlParsing from "aml-parsing";
import * as AzogInterface from "azog-interface";

export function convert(data: AmlParsing.DataInterface.Property[]): AzogInterface.IViewModelInterfaceJSON {
	const properties = {};
	for (const prop of data) {
		const type = convertType(prop.type);
		properties[prop.name] = type;
	}
	const res: AzogInterface.IViewModelInterfaceJSON = {
		properties
	};
	return res;
}

function convertType(type: AmlParsing.DataInterface.Type): AzogInterface.TypeJSON | undefined {
	if (typeof type !== 'number') {
		return undefined;
	}
	return typesMap[type];
}

const typesMap = {
	[AmlParsing.DataInterface.PrimitiveType.BOOLEAN]: 'boolean',
	[AmlParsing.DataInterface.PrimitiveType.NUMBER]: 'number',
	[AmlParsing.DataInterface.PrimitiveType.STRING]: 'string'
};
