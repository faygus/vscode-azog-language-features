import { AmlParsingError } from "./error";

export class AmlParsingResults extends Array<IAmlParsingResult<ParsingType>> {
	constructor(data?: IAmlParsingResult<ParsingType>[]) {
		super();
		if (data) {
			this.push(...data);
		}
	}

	add<T extends keyof IParsingTypeDetailMap>(data: IAmlParsingResult<T>): void {
		this.push(data);
	}
}

interface IAmlParsingResult<T extends keyof IParsingTypeDetailMap> {
	parsingType: T;
	detail: IParsingTypeDetailMap[T];
}

export enum ParsingType {
	OPEN_TAG,
	ATTRIBUTE_NAME,
	ATTRIBUTE_VALUE,
	CLOSE_TAG,
	ERROR,
}

interface IParsingTypeDetailMap {
	[ParsingType.ERROR]: AmlParsingError,
	[ParsingType.OPEN_TAG]: IOpenTagInfos,
	[ParsingType.CLOSE_TAG]: ICloseTagInfos,
	[ParsingType.ATTRIBUTE_NAME]: IAttributeNameInfos,
	[ParsingType.ATTRIBUTE_VALUE]: IAttributeValueInfos,
}

interface IParsingInfos {
	offset: number;
}

interface IOpenTagInfos extends IParsingInfos {
	tag: string;
}

interface ICloseTagInfos extends IParsingInfos {
	tag: string;
}

interface IAttributeNameInfos extends IParsingInfos {
	attributeName: string;
}

interface IAttributeValueInfos extends IParsingInfos {
	attributeValue: string;
}

export type TagOpenedListener = (data: IOpenTagInfos) => void;
export type AttributeNameListener = (data: IAttributeNameInfos) => void;
export type AttributeValueListener = (data: IAttributeValueInfos) => void;
export type ErrorListener = (error: AmlParsingError) => void;
