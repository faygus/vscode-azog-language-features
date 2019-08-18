import { antiCapitalize } from "../utils/string-utils";
import { XmlDocumentRules, XmlAttributeWithEnumType } from "../types/document-rules";
import * as AmlParsing from "aml-parsing";

export function jsonToAzog(data: AmlParsing.ViewFile.Interpretation, rules: XmlDocumentRules): any {
	const interpreter = new JsonInterpreter(rules);
	return interpreter.interpret(data);
}

class JsonInterpreter {
	constructor(private _rules: XmlDocumentRules) {

	}

	interpret(data: AmlParsing.ViewFile.Interpretation): any {
		const viewType = JsonInterpreter.convertXmlTagToJsonKey(data.template.root.tag);
		const attributes = {};
		for (const attribute of data.template.root.attributes) {
			const attributeName = attribute.name;
			const attributeValue = attribute.value;
			attributes[attributeName] = this.processAttribute(viewType, attributeName, attributeValue);
		}
		const res: any = { // TODO use type IViewAnyDeclarationJSON from azog lib
			type: viewType,
			value: {
				...attributes
			}
		};
		/*for (const child of data.children) {
			const tagSplitted = child.tag.split('.');
			if (tagSplitted.length > 0 && tagSplitted[0] === data.tag) {
				const attributeName = JsonInterpreter.convertXmlTagToJsonKey(tagSplitted.slice(1).join('.'));
				res.value[attributeName] = {
					...child.attributes
				};
			} else {
				// dataToAzog(child); // TODO
			}
		}*/ // TODO
		return res;
	}

	/**
	 * Example :
	 * size: 'Small' returns 0
	 * size: 'Medium' returns 1
	 */
	private processAttribute(tag: string, name: string, value: string | AmlParsing.Json.IKeyValue | AmlParsing.Expression.Interpretation) {
		const element = this._rules.getElement(tag);
		if (!element) {
			throw new Error(`no element ${tag}`);
		}
		const attribute = element.getAttribute(name);
		if (!attribute) {
			throw new Error(`no attribute ${name} for element ${tag}`);
		}
		// TODO expressionType
		if (value instanceof AmlParsing.Expression.Interpretation) {
			return {
				value: value.argument instanceof AmlParsing.Expression.VariableIdentifier ? {
					propertyName: value.argument.name
				} : value.argument,
				pipe: undefined // value.pipeIdentifier // TODO pipe should be number
			};
		}
		if (XmlAttributeWithEnumType.typeIsEnum(attribute)) {
			const values = XmlAttributeWithEnumType.getEnum(attribute);
			if (typeof value !== 'string') {
				throw new Error(`${JSON.stringify(value)} is not assignable to ${tag}.${name}`);
			}
			const index = values.indexOf(value);
			if (index < 0) {
				throw new Error(`${value} is not assignable to ${tag}.${name}`);
			}
			return index;
		}
		if (typeof value === 'object') {
			const subAttributes = attribute.getAllSubAttributes();
			const res: any = {};
			for (const subAttributeName in value) {
				const subAttribute = subAttributes.find(a => a.name === subAttributeName);
				if (!subAttribute) {
					throw new Error(`no sub attribute ${subAttributeName} in ${tag}.${name}`);
				}
				const subAttributeValue = value[subAttributeName];
				if (XmlAttributeWithEnumType.typeIsEnum(subAttribute)) {
					const values = XmlAttributeWithEnumType.getEnum(subAttribute);
					if (typeof subAttributeValue !== 'string') {
						throw new Error(`${JSON.stringify(subAttributeValue)} is not assignable to ${tag}.${name}.${subAttributeName}`);
					}
					const index = values.indexOf(subAttributeValue);
					if (index < 0) {
						throw new Error(`${subAttributeValue} is not assignable to ${tag}.${name}.${subAttributeName}`);
					}
					res[subAttributeName] = index;
				} else {
					res[subAttributeName] = subAttributeValue;
				}
			}
			return res;
		}
		return value;
	}

	/**
	 * example : convert LabelWF to labelWF
	 */
	static convertXmlTagToJsonKey(tag: string): string {
		return antiCapitalize(tag);
	}
}
