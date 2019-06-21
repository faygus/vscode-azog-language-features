import { AmlParsingError } from "../error";
import { Range } from "../../types/range";
import { XmlNode } from "../../types/xml-node";

export class AmlParsingResults extends Array<IAnyAmlParsingResult> {
	constructor(data?: IAnyAmlParsingResult[]) {
		super();
		if (data) {
			this.push(...data);
		}
	}

	add(data: IAnyAmlParsingResult): void {
		this.push(data);
	}

	get last(): IAnyAmlParsingResult | undefined {
		if (this.length === 0) return undefined;
		return this[this.length - 1];
	}

	getParsingElement(offset: number): IAnyAmlParsingResult | undefined {
		for (const element of this) {
			const elt = element.detail;
			if (elt instanceof IParsingInfos) {
				if (elt.range.isInside(offset)) {
					return element;
				}
				if (offset < elt.range.start) {
					return undefined;
				}
			}
		}
		return undefined;
	}

	getLastElementOfType<T extends keyof IParsingTypeDetailMap>(type: T): IAmlParsingResult<T> | undefined {
		const res = this.copy().reverse().find(a => a.parsingType === type);
		if (!res) return undefined;
		const result = <IAmlParsingResult<T>>res;
		return result;
	}

	trunc(index: number): AmlParsingResults {
		const data: IAnyAmlParsingResult[] = [];
		let i = 0;
		for (const a of this) {
			if (i < index) {
				data.push(a);
			} else {
				break;
			}
			i++;
		}
		return new AmlParsingResults(data);
	}

	getContext(offset: number): XmlNode[] {
		if (this.length === 0) return [];
		const res: XmlNode[] = [];
		let i = 0;
		let element = this[i];
		let attributeName: string | undefined;
		let node: XmlNode | undefined;
		while (element.detail.range.end <= offset) {
			switch (element.parsingType) {
				case ParsingType.OPEN_TAG:
					node = new XmlNode(element.detail.tag);
					res.push(node);
					break;
				case ParsingType.ATTRIBUTE_NAME:
					attributeName = element.detail.attributeName;
					break;
				case ParsingType.ATTRIBUTE_VALUE:
					if (node && attributeName) {
						node.attributes[attributeName] = element.detail.attributeValue;
					}
					break;
				case ParsingType.CLOSE_TAG:
					res.pop();
					break;
			}
			element = this[++i];
		}
		res.pop();
		return res;
	}

	private copy(): IAnyAmlParsingResult[] {
		const res: IAnyAmlParsingResult[] = [];
		let i = 0;
		for (const a of this) {
			res.push(a);
		}
		return res;
	}
}

export interface IAmlParsingResult<T extends keyof IParsingTypeDetailMap> {
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
	[ParsingType.OPEN_TAG]: OpenTagInfos,
	[ParsingType.CLOSE_TAG]: CloseTagInfos,
	[ParsingType.ATTRIBUTE_NAME]: AttributeNameInfos,
	[ParsingType.ATTRIBUTE_VALUE]: AttributeValueInfos,
}

type IAnyAmlParsingResult =
	IAmlParsingResult<ParsingType.ERROR> |
	IAmlParsingResult<ParsingType.OPEN_TAG> |
	IAmlParsingResult<ParsingType.CLOSE_TAG> |
	IAmlParsingResult<ParsingType.ATTRIBUTE_NAME> |
	IAmlParsingResult<ParsingType.ATTRIBUTE_VALUE>;

export class IParsingInfos {

	constructor(public offset: number, protected _text: string) {
	}

	get range(): Range {
		return new Range(this.offset - this._text.length, this.offset);
	}

	getTextAtOffset(offset: number): string {
		if (offset < this.range.start) {
			return '';
		}
		return this._text.slice(0, offset - this.range.start);
	}
}

export class OpenTagInfos extends IParsingInfos {
	constructor(offset: number, tag: string) {
		super(offset, tag);
	}

	get tag(): string {
		return this._text;
	}
}

export class CloseTagInfos extends IParsingInfos {
	constructor(offset: number, tag: string) {
		super(offset, tag);
	}

	get tag(): string {
		return this._text;
	}
}

export class AttributeNameInfos extends IParsingInfos {
	constructor(offset: number, attributeName: string) {
		super(offset, attributeName);
	}

	get attributeName(): string {
		return this._text;
	}
}

export class AttributeValueInfos extends IParsingInfos {
	constructor(offset: number, attributeValue: string) {
		super(offset, attributeValue);
	}

	get attributeValue(): string {
		return this._text;
	}
}

export type TagOpenedListener = (data: OpenTagInfos) => void;
export type AttributeNameListener = (data: AttributeNameInfos) => void;
export type AttributeValueListener = (data: AttributeValueInfos) => void;
export type ErrorListener = (error: AmlParsingError) => void;
