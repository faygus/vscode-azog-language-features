import { XmlDepthPath, XmlNode } from "../types/xml-node";
import { AmlParsingResults, AttributeNameListener, AttributeValueListener, ErrorListener, IAmlParsingResult, ParsingType, TagOpenedListener, OpenTagInfos, AttributeNameInfos, AttributeValueInfos } from "./types/aml-parsing-result";
import { CodeUnitFactory } from "./code-unit-factory";
import { AmlParsingError, AmlParsingErrorType } from "./error";
import { tokens } from "./tokens";
import { CodeSequence } from "./types/code-sequence";

/*
** AML means Azog markup language
*/
export class AMLParser {
	public codeSequence = new CodeSequence();
	public parsingResults = new AmlParsingResults();

	private _tagOpenedListener?: TagOpenedListener;
	private _attributeNameListener?: AttributeNameListener;
	private _attributeValueListener?: AttributeValueListener;
	private _errorListener?: ErrorListener;

	private _stringParser: StringParser;
	private _nodesPath = new XmlDepthPath();

	constructor(private _data: string) {
		this._stringParser = new StringParser(this._data);
	}

	parse(): AmlParsingResults {
		while (this._stringParser.currentChar) {
			this.parseNewTag();
		}
		return this.parsingResults;
	}

	private parseNewTag(): void {
		const stringParser = this._stringParser;
		const beforeTag = stringParser.navigateUntil(tokens.tagOpenBracket);
		const beforeTagParser = new StringParser(beforeTag.text);
		if (beforeTagParser.hasText) {
			const textStart = beforeTagParser.navigateToFirstNonEmptyChar().offset;
			this.codeSequence.add(CodeUnitFactory.createTextOutsideNode(textStart,
				beforeTag.text.trim()));
			this.throwError(beforeTag.offset, AmlParsingErrorType.TEXT_OUTSIDE_NODE);
		}
		if (!beforeTag.stopPattern) {
			return;
		}
		const closeTagToken = `/`;
		if (stringParser.nextString.startsWith(closeTagToken)) {
			stringParser.next(closeTagToken.length);
			this.parseCloseTag();
			return;
		}
		const tagInfos = stringParser.navigateUntil([tokens.tagCloseBracket, selfCloseToken, ...whiteSpaceCharacters]);
		const tag = tagInfos.text;
		this.registerTag(tag, tagInfos.offset);
		if (tagInfos.stopPattern === selfCloseToken) {
			this._nodesPath.pop();
			return;
		} else if (tagInfos.stopPattern === tokens.tagCloseBracket) {
			return;
		}
		if (this.checkCloseTag()) return;
		this.parseAttribute(tag);
	}

	/**
	 * returns true if the tag is closed
	 */
	private checkCloseTag(): boolean {
		this._stringParser.navigateToFirstNonEmptyChar();
		if (this._stringParser.nextString.startsWith(selfCloseToken)) {
			this._nodesPath.pop();
			this._stringParser.next(selfCloseToken.length);
			return true;
		}
		if (this._stringParser.nextString.startsWith(tokens.tagCloseBracket)) {
			this._stringParser.next(tokens.tagCloseBracket.length);
			return true;
		}
		return false;
	}

	private parseCloseTag(): void {
		this._stringParser.navigateToFirstNonEmptyChar();
		const infos = this._stringParser.navigateUntil([tokens.tagCloseBracket, ...whiteSpaceCharacters]);
		const offset = this._stringParser.offset - infos.stopPattern.length;
		if (infos.text) {
			if (!this._nodesPath.closeTag(infos.text)) {
				this.throwError(offset, AmlParsingErrorType.UNMATCHED_CLOSING_TAG);
			}
		} else {
			this.throwError(offset, AmlParsingErrorType.UNMATCHED_CLOSING_TAG); // closing tag without name
		}
		if (infos.stopPattern === tokens.tagCloseBracket) {
			return;
		}
		this._stringParser.navigateUntil(tokens.tagCloseBracket);
	}

	private parseAttribute(tag: string): void {
		// parse attribute name
		const attributeNameInfos = this._stringParser.navigateUntil([tokens.equal, tokens.tagCloseBracket, ...whiteSpaceCharacters]);
		const attributeName = attributeNameInfos.text;
		const attributeNameOffset = attributeNameInfos.offset;
		if (attributeNameInfos.stopPattern === tokens.tagCloseBracket) {
			this.registerAttributeWithoutValue(attributeName, attributeNameOffset);
			return;
		}
		if (Utils.charIsEmpty(attributeNameInfos.stopPattern)) {
			if (this._stringParser.navigateToFirstNonEmptyChar().currentChar !== tokens.equal) {
				this.registerAttributeWithoutValue(attributeName, attributeNameOffset);
				if (this.checkCloseTag()) return;
				return this.parseAttribute(tag);
			}
			this._stringParser.next(); // skip the equal char
		}
		this.registerAttributeName(tag, attributeName, attributeNameOffset);
		// parse attribute value
		const firstAttributeValueChar = this._stringParser.navigateToFirstNonEmptyChar().currentChar;
		if (firstAttributeValueChar === tokens.quote) {
			this._stringParser.next();
			const attributeValueInfos = this._stringParser.navigateUntil({
				isValid(data) {
					if (data.length === 0) return null;
					const reversedString = data.split('').reverse().join('');
					if (reversedString[0] !== tokens.quote) return null;
					let escaped = false;
					for (let i = 1; i < reversedString.length; i++) {
						const char = reversedString[i];
						if (char !== tokens.escape) {
							return escaped ? null : {
								stopPattern: tokens.quote
							};
						}
						escaped = !escaped;
					}
					return null;
				}
			});
			const attributeValue = attributeValueInfos.text;
			this.registerAttributeValue(attributeValue, attributeValueInfos.offset);
		} else {
			// TODO attribute inside {...}
		}
		if (this.checkCloseTag()) return;
		return this.parseAttribute(tag);
	}

	set onTagOpened(value: TagOpenedListener) {
		this._tagOpenedListener = value;
	}

	set onAttributeName(value: AttributeNameListener) {
		this._attributeNameListener = value;
	}

	set onAttributeValue(value: AttributeValueListener) {
		this._attributeValueListener = value;
	}

	set onError(value: ErrorListener) {
		this._errorListener = value;
	}

	private emitTagOpened(tag: string, offset: number): void {
		const parsingElement = new OpenTagInfos(offset, tag);
		if (this._tagOpenedListener) {
			this._tagOpenedListener(parsingElement);
		}
		this.parsingResults.add({
			parsingType: ParsingType.OPEN_TAG,
			detail: parsingElement
		});
	}

	private emitAttributeName(tag: string, attributeName: string, offset: number): void {
		const parsingElement = new AttributeNameInfos(offset, attributeName);
		if (this._attributeNameListener) {
			this._attributeNameListener(parsingElement);
		}
		this.parsingResults.add({
			parsingType: ParsingType.ATTRIBUTE_NAME,
			detail: parsingElement
		});
	}

	private emitAttributeValue(tag: string, attributeName: string, attributeValue: string, offset: number): void {
		const parsingElement = new AttributeValueInfos(offset, attributeValue);
		if (this._attributeValueListener) {
			this._attributeValueListener(parsingElement);
		}
		this.parsingResults.add({
			parsingType: ParsingType.ATTRIBUTE_VALUE,
			detail: parsingElement
		});
	}

	private throwError(offset: number, type?: AmlParsingErrorType): void {
		if (type === undefined) {
			type = AmlParsingErrorType.DEFAULT;
		}
		const error = new AmlParsingError(type, offset);
		if (this._errorListener) {
			this._errorListener(error);
		}
		this.parsingResults.add({
			parsingType: ParsingType.ERROR,
			detail: error
		});
	}

	private registerTag(tag: string, endOffset: number): void {
		this._nodesPath.push(new XmlNode(tag));
		this.emitTagOpened(tag, endOffset);
		this.codeSequence.add(CodeUnitFactory.createTag(endOffset - tag.length, tag));
	}

	private registerAttributeWithoutValue(attributeName: string, endOffset: number): void {
		const offset = endOffset - attributeName.length;
		this.throwError(offset, AmlParsingErrorType.ATTRIBUTE_WITHOUT_VALUE);
		this.codeSequence.add(CodeUnitFactory.createAttributeWithoutValue(offset, attributeName));
	}

	private registerAttributeName(tag: string, attributeName: string, endOffset: number): void {
		this.emitAttributeName(tag, attributeName, endOffset);
		const offset = endOffset - attributeName.length;
		this.codeSequence.add(CodeUnitFactory.createAttributeName(offset, attributeName));
	}

	private registerAttributeValue(attributeValue: string, endOffset: number): void {
		const lastParsing = <IAmlParsingResult<ParsingType.ATTRIBUTE_NAME>>this.parsingResults.last;
		const attributeName = lastParsing.detail.attributeName;
		const offset = endOffset - attributeValue.length;
		const tagInfos = this._nodesPath.getFirstParentNode();
		if (!tagInfos) {
			return;
		}
		this.emitAttributeValue(tagInfos.tag, attributeName, attributeValue, endOffset);
		this.codeSequence.add(CodeUnitFactory.createAttributeValue(offset, attributeValue));
	}
}

export class StringParser {
	private _offset = 0;

	constructor(private _data: string) {

	}

	navigateToFirstNonEmptyChar(): StringParser {
		for (const char of this.nextString) {
			if (Utils.charIsEmpty(char)) {
				this._offset++;
				continue;
			}
			return this;
		}
		return this;
	}

	navigateToLastNonEmptyChar(): StringParser {
		const nextString = this.nextString.trimRight();
		this._offset += nextString.length - 1;
		return this;
	}

	next(length?: number): boolean {
		if (this._offset >= this._data.length) {
			return false;
		}
		const delta = length === undefined ? 1 : length;
		this._offset += delta;
		if (this._offset > this._data.length) {
			this._offset = this._data.length;
		}
		return this._offset < this._data.length;
	}

	parseToken(exclude?: string[]): string {
		let res = '';
		this.navigateToFirstNonEmptyChar();
		while (true) {
			const currentChar = this.currentChar;
			if (currentChar === undefined) {
				return res;
			}
			if (Utils.charIsEmpty(currentChar) ||
				(exclude && exclude.indexOf(currentChar) >= 0)) {
				return res;
			}
			res += this.currentChar;
			this.next();
		}
	}

	navigateUntil(validator: PositionValidator): NavigationInfos;
	navigateUntil(tokens: string[]): NavigationInfos;
	navigateUntil(token: string): NavigationInfos;
	navigateUntil(data: PositionValidator | string | string[]): NavigationInfos {
		const firstOffset = this._offset;
		const content = this.nextString;
		while (true) {
			const currentChar = this.currentChar;
			if (currentChar === undefined) {
				return {
					text: content,
					offset: this._offset,
					stopPattern: ''
				};
			}
			const str = content.slice(0, this.offset + 1 - firstOffset);
			if (typeof data === 'string') {
				if (str.endsWith(data)) {
					this._offset++;
					return {
						text: content.slice(0, this._offset - firstOffset - data.length),
						offset: this._offset - data.length,
						stopPattern: data
					};
				}
			} else if (Array.isArray(data)) {
				const endPattern = data.reduce((prev, next) => {
					if (str.endsWith(next)) {
						if (next.length > prev.length) {
							return next;
						}
					}
					return prev;
				}, '');
				if (endPattern) { // TODO duplicated code
					this._offset++;
					return {
						text: content.slice(0, this._offset - firstOffset - endPattern.length),
						offset: this._offset - endPattern.length,
						stopPattern: endPattern
					};
				}
			} else {
				const validatorPositionResult = data.isValid(str);
				if (validatorPositionResult) {
					this._offset++;
					return {
						text: content.slice(0, this._offset - firstOffset - validatorPositionResult.stopPattern.length),
						offset: this._offset - validatorPositionResult.stopPattern.length,
						stopPattern: validatorPositionResult.stopPattern
					};
				}
			}
			this.next();
		}
	}

	get currentChar(): string | undefined {
		if (this._offset >= this._data.length) {
			return undefined;
		}
		return this._data[this._offset];
	}

	get nextString(): string {
		return this._data.slice(this._offset);
	}

	get offset(): number {
		return this._offset;
	}

	get hasText(): boolean {
		return this._data.trim().length > 0;
	}
}

class Utils {
	static charIsEmpty(char: string): boolean {
		return whiteSpaceCharacters.indexOf(char) >= 0;
	}
	static isAplphaNumeric(char: string): boolean {
		char = char[0];
		const res = char.match(/[a-zA-Z0-9_-]/);
		return res !== null && res.length > 0;
	}
	static isLetter(char: string): boolean {
		char = char[0];
		const res = char.match(/[a-zA-Z]/);
		return res !== null && res.length > 0;
	}
}

interface PositionValidator {
	isValid(data: string): PositionValidatorResult | null;
}

interface PositionValidatorResult {
	stopPattern: string;
}

interface NavigationInfos {
	text: string;
	offset: number;
	stopPattern: string;
}

function isPositionValidator(data: any): data is PositionValidator {
	return typeof data === 'object' && data.isValid !== undefined &&
		typeof data.isValid === 'function';
}

const whiteSpaceCharacters = [' ', '\t', '\n', '\r'];
const selfCloseToken = `/${tokens.tagCloseBracket}`;
