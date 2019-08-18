import * as AmlParsing from "aml-parsing";
import { BaseHighlight } from "../base-highlight";

export class ObjectHighlight extends BaseHighlight<AmlParsing.Json.Token> {

	protected _colors = {
		[Scope.KEY]: '#569cd6',
		[Scope.VALUE]: '#ce9178'
	};

	protected _highlight(data: AmlParsing.Json.Token): void {
		this.highlightToken(data.content.key, Scope.KEY);
		if (data.content.value instanceof AmlParsing.Json.LiteralValueToken) {
			this.highlightToken(data.content.value, Scope.VALUE);
		} else {
			const highlightManager = new ObjectHighlight(this._decorator);
			const token = new AmlParsing.Json.Token(data.content.value.tokenUnit, data.content.value.content);
			highlightManager.highlight(token);
		}
	}
}

enum Scope {
	KEY,
	VALUE,
};
