import { CodeUnit, CodeUnitType } from "./types/code-unit";

export class CodeUnitFactory {
	static createTextOutsideNode(offset: number, text: string): CodeUnit {
		return new CodeUnit(offset, text, CodeUnitType.TEXT_OUTSIDE_NOde);
	}
	static createTag(offset: number, tag: string): CodeUnit {
		return new CodeUnit(offset, tag, CodeUnitType.TAG);
	}
	static createAttributeWithoutValue(offset: number, attributeName: string): CodeUnit {
		return new CodeUnit(offset, attributeName, CodeUnitType.ATTRIBUTE_WITHOUT_VALUE);
	}
	static createAttributeName(offset: number, attributeName: string): CodeUnit {
		return new CodeUnit(offset, attributeName, CodeUnitType.ATTRIBUTE_NAME);
	}
	static createAttributeValue(offset: number, attributeValue: string): CodeUnit {
		return new CodeUnit(offset, attributeValue, CodeUnitType.ATTRIBUTE_VALUE);
	}
}
