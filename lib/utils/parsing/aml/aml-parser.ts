import { AmlParsingError, AmlParsingErrorType } from "./error";
import { tokens } from "./tokens";
import { ParsedTags } from "./tags-types";
import { AmlParsingResults, ParsingType, TagOpenedListener, AttributeNameListener, AttributeValueListener, ErrorListener } from "./aml-parsing-result";

/*
** AML means Azog markup language
*/
export class AMLParser {
	private _tagOpenedListener?: TagOpenedListener;
	private _attributeNameListener?: AttributeNameListener;
	private _attributeValueListener?: AttributeValueListener;
	private _errorListener?: ErrorListener;

	private _stringParser: StringParser;
	private _parsedTags = new ParsedTags();
	private _parsingResults = new AmlParsingResults();

	constructor() {
	}

	parse(data: string): AmlParsingResults {
		const stringParser = new StringParser(data);
		this._stringParser = stringParser;
		while (stringParser.currentChar) {
			this.parseNewTag();
		}
		return this._parsingResults;
	}

	private parseNewTag(): void {
		const stringParser = this._stringParser;
		const parsedTags = this._parsedTags;
		const beforeTag = stringParser.navigateUntil(tokens.tagOpenBracket);
		if (beforeTag.text.trim().length > 0) {
			if (!parsedTags.hasTagsOpened()) {
				this.throwError(stringParser.offset, AmlParsingErrorType.TEXT_OUTSIDE_NODE);
			}
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
		parsedTags.openTag(tag);
		this.emitTagOpened(tagInfos.text, stringParser.offset - tagInfos.stopPattern.length);
		if (tagInfos.stopPattern === selfCloseToken) {
			parsedTags.closeLastTag();
			return;
		} else if (tagInfos.stopPattern === tokens.tagCloseBracket) {
			return;
		}
		stringParser.navigateToFirstNonEmptyChar();
		if (stringParser.nextString.startsWith(selfCloseToken)) {
			parsedTags.closeLastTag();
			stringParser.next(selfCloseToken.length);
			return;
		}
		if (stringParser.nextString.startsWith(tokens.tagCloseBracket)) {
			stringParser.next(tokens.tagCloseBracket.length);
			return;
		}
		this.parseAttribute();
	}

	private parseCloseTag(): void {
		const stringParser = this._stringParser;
		stringParser.navigateToFirstNonEmptyChar();
		const infos = stringParser.navigateUntil([tokens.tagCloseBracket, ...whiteSpaceCharacters]);
		const offset = stringParser.offset - infos.stopPattern.length;
		if (infos.text) {
			if (!this._parsedTags.closeTag(infos.text)) {
				this.throwError(offset, AmlParsingErrorType.UNMATCHED_CLOSING_TAG);
			}
		} else {
			this.throwError(offset, AmlParsingErrorType.UNMATCHED_CLOSING_TAG); // closing tag without name
		}
		if (infos.stopPattern === tokens.tagCloseBracket) {
			return;
		}
		stringParser.navigateUntil(tokens.tagCloseBracket);
	}

	private parseAttribute(): void {
		const tag = this._parsedTags.lastOpenedTag;
		if (!tag) {
			return;
		}
		// parse attribute name
		const stringParser = this._stringParser;
		if (!stringParser.navigateToFirstNonEmptyChar()) {
			return;
		}
		if (stringParser.nextString.startsWith(selfCloseToken)) {
			this._parsedTags.closeLastTag();
			stringParser.next(selfCloseToken.length);
			return;
		}
		if (stringParser.nextString.startsWith(tokens.tagCloseBracket)) {
			stringParser.next(tokens.tagCloseBracket.length);
			return;
		}
		const attributeNameInfos = stringParser.navigateUntil([tokens.equal, tokens.tagCloseBracket, ...whiteSpaceCharacters]);
		const attributeName = attributeNameInfos.text;
		const attributeNameOffset = stringParser.offset - attributeNameInfos.stopPattern.length;
		if (attributeNameInfos.stopPattern === tokens.tagCloseBracket) {
			this.throwError(attributeNameOffset, AmlParsingErrorType.ATTRIBUTE_WITHOUT_VALUE);
			return;
		}
		if (Utils.charIsEmpty(attributeNameInfos.stopPattern)) {
			if (stringParser.navigateToFirstNonEmptyChar() !== tokens.equal) {
				this.throwError(attributeNameOffset, AmlParsingErrorType.ATTRIBUTE_WITHOUT_VALUE);
				return this.parseAttribute();
			}
			stringParser.next();
		}
		this.emitAttributeName(tag.name, attributeName, attributeNameOffset);
		// parse attribute value
		const firstAttributeValueChar = stringParser.navigateToFirstNonEmptyChar();
		if (firstAttributeValueChar === tokens.quote) {
			stringParser.next();
			const attributeValueInfos = stringParser.navigateUntil({
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
			const offset = stringParser.offset - attributeValueInfos.stopPattern.length;
			this.emitAttributeValue(tag.name, attributeName, attributeValue, offset);
		} else {
			// TODO attribute inside {...}
		}
		return this.parseAttribute();
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
		if (this._tagOpenedListener) {
			this._tagOpenedListener({
				tag, offset
			});
		}
		this._parsingResults.add({
			parsingType: ParsingType.OPEN_TAG,
			detail: {
				tag,
				offset
			}
		})
	}

	private emitAttributeName(tag: string, attributeName: string, offset: number): void {
		if (this._attributeNameListener) {
			this._attributeNameListener({ attributeName, offset });
		}
		this._parsingResults.add({
			parsingType: ParsingType.ATTRIBUTE_NAME,
			detail: {
				attributeName,
				offset
			}
		});
	}

	private emitAttributeValue(tag: string, attributeName: string, attributeValue: string, offset: number): void {
		if (this._attributeValueListener) {
			this._attributeValueListener({ attributeValue, offset });
		}
		this._parsingResults.add({
			parsingType: ParsingType.ATTRIBUTE_VALUE,
			detail: {
				attributeValue,
				offset
			}
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
		this._parsingResults.add({
			parsingType: ParsingType.ERROR,
			detail: error
		});
	}
}

class StringParser {
	private _offset = 0;

	constructor(private _data: string) {

	}

	navigateToFirstNonEmptyChar(): string | undefined {
		for (const char of this.nextString) {
			if (Utils.charIsEmpty(char)) {
				this._offset++;
				continue;
			}
			return this.currentChar;
		}
		return this.currentChar;
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
					stopPattern: ''
				};
			}
			const str = content.slice(0, this.offset + 1 - firstOffset);
			if (typeof data === 'string') {
				if (str.endsWith(data)) {
					this._offset++;
					return {
						text: content.slice(0, this._offset - firstOffset - data.length),
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
						stopPattern: endPattern
					};
				}
			} else {
				const validatorPositionResult = data.isValid(str);
				if (validatorPositionResult) {
					this._offset++;
					return {
						text: content.slice(0, this._offset - firstOffset - validatorPositionResult.stopPattern.length),
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
	stopPattern: string;
}

function isPositionValidator(data: any): data is PositionValidator {
	return typeof data === 'object' && data.isValid !== undefined &&
		typeof data.isValid === 'function';
}

const whiteSpaceCharacters = [' ', '\t', '\n'];
const selfCloseToken = `/${tokens.tagCloseBracket}`;
