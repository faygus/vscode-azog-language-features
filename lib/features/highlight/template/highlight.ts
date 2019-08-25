import * as AmlParsing from "aml-parsing";
import { BaseHighlight } from "../base-highlight";
import { TagWithAttributeHighlight } from "../tag-with-attributes/highlight";

export class TemplateHighlight extends BaseHighlight<AmlParsing.Template.Token> {

	protected _colors = {};

	protected _highlight(data: AmlParsing.Template.Token): void {
		const highlighter = new TagWithAttributeHighlight(this._decorator);
		if (data.content.body instanceof AmlParsing.Template.CustomView.Token) {
			highlighter.highlight(data.content.body.content.root);
			for (const view of data.content.body.content.embededViews) {
				highlighter.highlight(view);
			}
		} else {
			if (data.content.body.content.blockStatement) {
				highlighter.highlight(data.content.body.content.blockStatement);
			}
			// TODO highlight test statement
		}
	}
}
