export interface IJsonData {
	tag: string;
	attributes: IJsonAttributes;
	children: IJsonData[];
}

export type IJsonAttributes = {[key: string]: IJsonAttribute};
export type IJsonAttribute = string | {[key: string]: IJsonAttribute};
