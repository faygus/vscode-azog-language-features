export interface ITagsDefinitions {
	[tagName: string]: ITagDefinition;
}

interface ITagDefinition {
	attributes: ITagAttributesDefinition;
}

interface ITagAttributesDefinition {
	[attributeName: string]: PropertyType;
}

export type SimpleType = 'string' | 'number';
export type ComplexType = { [propName: string]: PropertyType };
export type EnumType = string[];
export type PropertyType = SimpleType | ComplexType | EnumType;
