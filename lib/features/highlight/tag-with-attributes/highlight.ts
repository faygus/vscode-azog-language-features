import * as AmlParsing from "aml-parsing";
import { BaseHighlight } from "../base-highlight";
import { ExpressionHighlight } from "../expression/highlight";
import { ObjectHighlight } from "../object/highlight";

export class TagWithAttributeHighlight extends BaseHighlight<AmlParsing.TagWithAttributes.Token> {

	protected _colors = {
		[Scope.TAG]: '#569cd6',
		[Scope.ATTRIBUTE_NAME]: '#9cdcfe',
		[Scope.LITERAL_VALUE]: '#ce9178',
	};

	protected _highlight(data: AmlParsing.TagWithAttributes.Token): void {
		this.highlightToken(data.content.tag, Scope.TAG);
		for (const attribute of data.content.attributes) {
			this.highlightToken(attribute.content.attributeName, Scope.ATTRIBUTE_NAME);
			if (attribute.content.value instanceof AmlParsing.Expression.Token) {
				const highlighter = new ExpressionHighlight(this._decorator);
				highlighter.highlight(attribute.content.value);
			} else if (attribute.content.value instanceof AmlParsing.Json.Token) {
				const highlighter = new ObjectHighlight(this._decorator);
				highlighter.highlight(attribute.content.value);
			} else {
				this.highlightToken(attribute.content.value, Scope.LITERAL_VALUE);
			}
		}
	}
}

enum Scope {
	TAG,
	ATTRIBUTE_NAME,
	LITERAL_VALUE,
};
