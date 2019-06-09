export interface ITagsDefinitions {
	[tagName: string]: ITagDefinition;
}

interface ITagDefinition {
	comment?: string;
	attributes: ITagAttributesDefinition;
}

interface ITagAttributesDefinition {
	[attributeName: string]: ITagAttributeDefinition;
}

export interface ITagAttributeDefinition {
	type: PropertyType;
	comment?: string;
};

export type SimpleType = 'string' | 'number';
export type ComplexType = { [propName: string]: ITagAttributeDefinition };
export type EnumType = string[];
export type PropertyType = SimpleType | ComplexType | EnumType;
