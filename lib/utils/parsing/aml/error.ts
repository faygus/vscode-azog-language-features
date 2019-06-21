import { IParsingInfos } from "./types/aml-parsing-result";

export class AmlParsingError extends IParsingInfos {
	type: AmlParsingErrorType;
	error: Error = new Error();

	constructor(type: AmlParsingErrorType, offset: number) {
		super(offset, '');
		this.type = type;
		this.error.message = `Error of parsing at offset ${offset} : ${errorMessages[type]}`;
	}
}

export enum AmlParsingErrorType {
	DEFAULT,
	MISSING_OPENING_BRACKET,
	ATTRIBUTE_WITHOUT_VALUE,
	TEXT_OUTSIDE_NODE,
	UNMATCHED_CLOSING_TAG,
}

const errorMessages = {
	[AmlParsingErrorType.DEFAULT]: 'AML Parsing error',
	[AmlParsingErrorType.MISSING_OPENING_BRACKET]: 'Opening bracket < missing',
	[AmlParsingErrorType.ATTRIBUTE_WITHOUT_VALUE]: 'Attribute without value',
	[AmlParsingErrorType.TEXT_OUTSIDE_NODE]: 'Text outside of node',
	[AmlParsingErrorType.UNMATCHED_CLOSING_TAG]: 'Unmatched closing tag',
}
