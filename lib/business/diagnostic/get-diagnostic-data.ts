import * as AmlParsing from "aml-parsing";
import { TextRange } from "../../types";
import { XmlDocumentRules, XmlAttributeWithEnumType } from "../../types/document-rules";
import { antiCapitalize } from "../../utils/string-utils";
import { AmlDiagnosticData } from "./diagnostic-data";

export class AmlDiagnosticDataManager {

	constructor(private _documentRules: XmlDocumentRules) {

	}

	diagnostic(data: string): AmlDiagnosticData[] {
		let res: AmlDiagnosticData[] = [];
		const parsingResult = AmlParsing.parseAmlCode(data);
		for (const diag of parsingResult.diagnostics) {
			const diagnosticData = new AmlDiagnosticData(diag.offset, 'error man !', 'error'); // TODO
			res.push(diagnosticData);
		}
		for (const token of parsingResult.tokens) {
			const error = this.checkError(token);
			if (error) res.push(error);
		}
		// TODO parsingResult.tree

		/*parser.onerror = () => {
			const position = new TextPosition(parser.line, parser.column);
			const data = new AmlDiagnosticData(position, parser.error.message,
				"error");
			res.push(data);
		};

		// TODO foreach tag
			const element = this._documentRules.getElement(antiCapitalize(tag));
			if (!element) {
					const data = new AmlDiagnosticData(textRange,
						errorMessages.unknownTag(tag), "info");
					res.push(data);
			}

				const attribute = element.getAttribute(antiCapitalize(attributeName));
				if (!attribute) {
						const AmlDiagnosticData = new AmlDiagnosticData(textRange,
							errorMessages.unknownAttribute(attributeName, rootName), // TODO rootName
							"info");
						res.push(AmlDiagnosticData);
				} else { // check sub attributes
					const schemaTagAttributes = attribute.getAllSubAttributes();
					Object.keys(tagData.attributes)
						.forEach((subAttributeName: string) => {
							if (schemaTagAttributes.findIndex(sta => sta.name === antiCapitalize(subAttributeName)) < 0) {
									const AmlDiagnosticData = new AmlDiagnosticData(textRange,
										errorMessages.unknownAttribute(subAttributeName, tag),
										"info");
									res.push(AmlDiagnosticData);
							}
							// TODO check type of attribute
						});
				}
			} else {
				let schemaTagAttributes = this._documentRules.getAllAttributes(antiCapitalize(tag));
				Object.keys(tagData.attributes)
					.forEach((attributeName: string) => {
						if (schemaTagAttributes.findIndex(sta => sta.name === antiCapitalize(attributeName)) < 0) {
								const AmlDiagnosticData = new AmlDiagnosticData(textRange,
									errorMessages.unknownAttribute(attributeName, tagData.name),
									"info");
								res.push(AmlDiagnosticData);
						}
						// TODO check type of attribute
					});
				// TODO check nested node (<Style> can not contain <Label> for example)
			}
		};
	});*/
		return res;
	}

	private checkError(token: AmlParsing.Model.Aml.Tokens): AmlDiagnosticData | null {
		if (token instanceof AmlParsing.Model.Aml.TagToken) {
			return this.checkTag(token);
		}
		if (token instanceof AmlParsing.Model.Aml.AtributeNameToken) {
			return this.checkAttributeName(token);
		}
		if (token instanceof AmlParsing.Model.Aml.AttributeValueToken) {
			return this.checkAttributeValue(token);
		}
		/*if (token.type === AmlParsing.AmlTokenType.JSON_KEY) {
			return this.checkAttributeSubPropertyName(token);
		}
		if (token.type === AmlParsing.AmlTokenType.JSON_LITERAL_VALUE) {
			return this.checkAttributeSubPropertyValue(token);
		}*/
		return null;
	}

	private checkTag(token: AmlParsing.Model.Aml.TagToken): AmlDiagnosticData | null {
		const tokenUnit = token.tokenUnit;
		const tag = tokenUnit.text;
		const element = this._documentRules.getElement(antiCapitalize(tag));
		if (element) return null;
		const range = new TextRange(tokenUnit.range.start, tokenUnit.range.end);
		const msg = errorMessages.unknownTag(tag);
		const data = new AmlDiagnosticData(range, msg, "info");
		return data;
	}

	private checkAttributeName(token: AmlParsing.Model.Aml.AtributeNameToken): AmlDiagnosticData | null {
		const tokenUnit = token.tokenUnit;
		const attributeName = tokenUnit.text;
		const tag = token.context.tag;
		const element = this._documentRules.getElement(antiCapitalize(tag));
		if (!element) return null;
		const attributes = this._documentRules.getAllAttributes(antiCapitalize(tag));
		if (attributes.find(a => a.name === attributeName)) return null;
		const range = new TextRange(tokenUnit.range.start, tokenUnit.range.end);
		const msg = errorMessages.unknownAttribute(attributeName, tag);
		const data = new AmlDiagnosticData(range, msg, "info");
		return data;
	}

	private checkAttributeValue(token: AmlParsing.Model.Aml.AttributeValueToken): AmlDiagnosticData | null {
		return null; // TODO
	}

	/*private checkAttributeSubPropertyName(tokenWithContext: AmlParsing.AmlTokenWithContext<AmlParsing.AmlTokenType.JSON_KEY>): AmlDiagnosticData | null {
		const token = tokenWithContext.token;
		const mainAttributeName = tokenWithContext.context.attributeName;
		const propName = token.text;
		const tag = tokenWithContext.context.element.tag;
		const element = this._documentRules.getElement(antiCapitalize(tag));
		if (!element) return null;
		const attributes = element.attributes;
		const attribute = attributes.find(a => a.name === mainAttributeName);
		if (!attribute) return null;
		const match = attribute.getAllSubAttributes().find(a => a.name === propName);
		// TODO check subAttribute of subAttribute
		if (match) return null;
		const range = new TextRange(token.range.start, token.range.end);
		const msg = errorMessages.unknownProperty(propName);
		const data = new AmlDiagnosticData(range, msg, "info");
		return data;
	}*/

	/*private checkAttributeSubPropertyValue(tokenWithContext: AmlParsing.AmlTokenWithContext<AmlParsing.AmlTokenType.JSON_LITERAL_VALUE>): AmlDiagnosticData | null {
		const token = tokenWithContext.token;
		const tag = tokenWithContext.context.element.tag;
		const attributeName = tokenWithContext.context.attributeName;
		const propValue = token.text;
		const propName = tokenWithContext.context.jsonContext.key;
		const element = this._documentRules.getElement(antiCapitalize(tag));
		if (!element) return null;
		const attribute = element.getAttribute(attributeName);
		if (!attribute) return null;
		const prop = attribute.getAllSubAttributes().find(a => a.name === propName); // TODO loop depth
		if (!prop) return null;
		if (XmlAttributeWithEnumType.typeIsEnum(prop)) {
			const values = XmlAttributeWithEnumType.getEnum(prop);
			const index = values.indexOf(propValue);
			if (index < 0) {
				const msg = `${propValue} is not assignable to ${propName}`;
				const range = new TextRange(token.range.start, token.range.end);
				const data = new AmlDiagnosticData(range, msg, "info");
				return data;
			}
		}
		return null;
	}*/
}

const errorMessages = {
	unknownTag: (tag: string) => `Unknown AML tag '${tag}'`,
	unknownAttribute: (attr: string, tag: string) => `Unknown AML attribute '${attr}' for tag '${tag}'`,
	unknownProperty: (prop: string) => `Unknown property '${prop}'`
};
