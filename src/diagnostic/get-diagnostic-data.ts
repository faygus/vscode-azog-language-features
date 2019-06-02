import { XmlDiagnosticData, TextPosition, TextRange } from "../types";
import * as sax from "sax";
import { XmlDocumentRules } from "../types/document-rules";

export class XmlDiagnosticDataManager {
	private _strict = true;

	constructor(private _documentRules: XmlDocumentRules) {

	}

	diagnostic(xmlContent: string): Promise<XmlDiagnosticData[]> {
		const stringSearch = new StringSearch(xmlContent);
		return new Promise<XmlDiagnosticData[]>(
			(resolve) => {
				const parser = sax.parser(true);
				let res: XmlDiagnosticData[] = [];

				parser.onerror = () => {
					// if (res.find(e => e.line === parser.line) === undefined) {
					const position = new TextPosition(parser.line, parser.column);
					const data = new XmlDiagnosticData(position, parser.error.message,
						this._strict ? "error" : "warning");
					res.push(data);
					// }
					parser.resume();
				};

				parser.onopentag = (tagData) => {
					let nodeNameSplitted: Array<string> = tagData.name.split('.');

					if (this._documentRules.hasElement(nodeNameSplitted[0])) {
						let schemaTagAttributes = this._documentRules.getAllAttributes(nodeNameSplitted[0]);
						nodeNameSplitted.shift();
						Object.keys(tagData.attributes).concat(nodeNameSplitted).forEach((a: string) => {
							if (schemaTagAttributes.findIndex(sta => sta.name === a) < 0 && a.indexOf(":") < 0 && a !== "xmlns") {
								const textRange = stringSearch.search(`${a}=`,
									{ line: parser.line, column: parser.column }, '<');
								if (textRange) {
									const data = new XmlDiagnosticData(textRange,
										errorMessages.unknownAttribute(a, tagData.name),
										this._strict ? "info" : "hint");
									res.push(data);
								}
							}
							// TODO check type of attribute
						});
						// TODO check nested node (<Style> can not contain <Label> for example)
					}
					else if (tagData.name.indexOf(":") < 0) {
						const textRange = stringSearch.searchFirstWord({
							line: parser.line, column: parser.column
						}, '<');
						if (textRange) {
							const data = new XmlDiagnosticData(textRange,
								errorMessages.unknownTag(tagData.name),
								this._strict ? "info" : "hint");
							res.push(data);
						}
					}
				};

				parser.onend = () => {
					resolve(res);
				};

				parser.write(xmlContent).close();
			});
	}
}

const errorMessages = {
	unknownTag: (tag: string) => `Unknown xml tag '${tag}'`,
	unknownAttribute: (attr: string, tag: string) => `Unknown xml attribute '${attr}' for tag '${tag}'`
}

class StringSearch {
	private _lines: string[];

	constructor(text: string) {
		this._lines = text.split('\n');
	}

	search(str: string, position: { line: number, column: number }, afterChar: string): TextRange | undefined {
		const area = this._lines.slice(0, position.line + 1).reverse();
		let lineIndex = position.line;
		for (const line of area) {
			const searchAfter = line.lastIndexOf(afterChar) + 1;
			const res = line.substring(searchAfter).indexOf(str);
			if (res >= 0) {
				const column = res + searchAfter;
				const result = new TextRange(
					new TextPosition(lineIndex, column),
					new TextPosition(lineIndex, column + str.length)
				);
				return result;
			}
			lineIndex--;
		}
		return new TextRange(
			new TextPosition(position.line, position.column),
			new TextPosition(position.line, position.column)
		);
	}

	searchFirstWord(position: { line: number, column: number }, afterChar: string): TextRange | undefined {
		const area = this._lines.slice(0, position.line + 1).reverse();
		let lineIndex = position.line;
		for (const line of area) {
			const searchAfter = line.lastIndexOf(afterChar);
			if (searchAfter >= 0) {
				const values = line.substring(searchAfter + 1).split(' ')
					.filter(e => e.trim().length > 0);
				if (values.length > 0) {
					const firstExpression = values[0];
					const column = line.substring(searchAfter + 1).indexOf(firstExpression) + searchAfter + 1;
					return new TextRange(
						new TextPosition(lineIndex, column),
						new TextPosition(lineIndex, column + firstExpression.length)
					);
				}
			}
			lineIndex--;
		}
		return new TextRange(
			new TextPosition(position.line, position.column),
			new TextPosition(position.line, position.column)
		);
	}
}
