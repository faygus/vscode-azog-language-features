import * as AmlParsing from "aml-parsing";
import { BaseHighlight } from "../base-highlight";

export class ExpressionHighlight extends BaseHighlight<AmlParsing.Expression.Token> {
	protected _colors = {
		[Scope.LITERAL_ARGUMENT]: 'red',
		[Scope.VARIABLE_ARGUMENT]: 'orange',
		[Scope.PIPE]: 'purple',
	};

	protected _highlight(data: AmlParsing.Expression.Token): void {
		this.highlightArgument(data.content.argument);
		if (data.content.pipe) {
			this.highlightToken(data.content.pipe, Scope.PIPE);
		}
	}

	private highlightArgument(argument: AmlParsing.Expression.LiteralArgumentToken |
		AmlParsing.CommonTokens.VariableIdentifierToken): void {
		if (argument instanceof AmlParsing.Expression.LiteralArgumentToken) {
			this.highlightToken(argument, Scope.LITERAL_ARGUMENT);
		} else {
			this.highlightToken(argument, Scope.VARIABLE_ARGUMENT);
		}
	}
}

enum Scope {
	LITERAL_ARGUMENT,
	VARIABLE_ARGUMENT,
	PIPE
};
