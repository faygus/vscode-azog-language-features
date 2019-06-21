import { Range } from "../../types/range";

/*
** An unit of code can be the symbol "=", "<", a tag name, an attribute name, ...
*/
export class CodeUnit {
	constructor(public offset: number, public text: string, public type: CodeUnitType) {
	}

	get range(): Range {
		return new Range(this.offset, this.offset + this.text.length);
	}
}

export enum CodeUnitType {
	TEXT_OUTSIDE_NOde,
	TAG,
	ATTRIBUTE_WITHOUT_VALUE,
	ATTRIBUTE_NAME,
	ATTRIBUTE_VALUE,
	// ...
}
