import { XmlDiagnosticData, TextPosition, TextRange } from "../types";
import * as sax from "sax";
import { XmlDocumentRules } from "../types/document-rules";
import { antiCapitalize } from "../utils/string-utils";
import { XmlDepthPath, XmlNode } from '../utils/parsing/types/xml-node';

export class XmlDiagnosticDataManager {

	constructor(private _documentRules: XmlDocumentRules) {

	}

	diagnostic(xmlContent: string): Promise<XmlDiagnosticData[]> {
		const stringSearch = new StringSearch(xmlContent);
		return new Promise<XmlDiagnosticData[]>(
			(resolve) => {
				const parser = sax.parser(true);
				sax.parser
				let res: XmlDiagnosticData[] = [];
				const xmlDepthPath = new XmlDepthPath();

				parser.onerror = () => {
					// if (res.find(e => e.line === parser.line) === undefined) {
					const position = new TextPosition(parser.line, parser.column);
					const data = new XmlDiagnosticData(position, parser.error.message,
						"error");
					res.push(data);
					// }
					parser.resume();
				};

				parser.onopentag = (tagData: sax.Tag) => {
					xmlDepthPath.push(new XmlNode(tagData.name, tagData.attributes));
					let nodeNameSplitted: Array<string> = tagData.name.split('.');
					const rootName = nodeNameSplitted[0];
					const element = this._documentRules.getElement(antiCapitalize(rootName));
					if (!element) {
						const textRange = stringSearch.searchFirstWord({
							line: parser.line, column: parser.column
						}, '<');
						if (textRange) {
							const data = new XmlDiagnosticData(textRange,
								errorMessages.unknownTag(tagData.name), "info");
							res.push(data);
						}
					} else if (nodeNameSplitted.length > 1) {
						const attributeName = nodeNameSplitted.slice().reverse()[0];
						const attribute = element.getAttribute(antiCapitalize(attributeName));
						if (!attribute) {
							const textRange = stringSearch.search(`.${attributeName}`,
								{ line: parser.line, column: parser.column }, '<');
							if (textRange) {
								const xmlDiagnosticData = new XmlDiagnosticData(textRange,
									errorMessages.unknownAttribute(attributeName, rootName), // TODO rootName
									"info");
								res.push(xmlDiagnosticData);
							}
						} else { // check sub attributes
							const schemaTagAttributes = attribute.getAllSubAttributes();
							Object.keys(tagData.attributes)
								.forEach((subAttributeName: string) => {
									if (schemaTagAttributes.findIndex(sta => sta.name === antiCapitalize(subAttributeName)) < 0) {
										const textRange = stringSearch.search(`${subAttributeName}=`,
											{ line: parser.line, column: parser.column }, '<');
										if (textRange) {
											const xmlDiagnosticData = new XmlDiagnosticData(textRange,
												errorMessages.unknownAttribute(subAttributeName, tagData.name),
												"info");
											res.push(xmlDiagnosticData);
										}
									}
									// TODO check type of attribute
								});
						}
					} else {
						let schemaTagAttributes = this._documentRules.getAllAttributes(antiCapitalize(rootName));
						Object.keys(tagData.attributes)
							.forEach((attributeName: string) => {
								if (schemaTagAttributes.findIndex(sta => sta.name === antiCapitalize(attributeName)) < 0) {
									const textRange = stringSearch.search(`${attributeName}=`,
										{ line: parser.line, column: parser.column }, '<');
									if (textRange) {
										const xmlDiagnosticData = new XmlDiagnosticData(textRange,
											errorMessages.unknownAttribute(attributeName, tagData.name),
											"info");
										res.push(xmlDiagnosticData);
									}
								}
								// TODO check type of attribute
							});
						// TODO check nested node (<Style> can not contain <Label> for example)
					}
				};

				parser.onclosetag = () => {
					xmlDepthPath.pop();
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
