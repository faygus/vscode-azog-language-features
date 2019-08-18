import * as AmlParsing from "aml-parsing";
import { BaseHighlight } from "../base-highlight";
import { TagWithAttributeHighlight } from "../tag-with-attributes/highlight";

export class TemplateHighlight extends BaseHighlight<AmlParsing.Template.Token> {

	protected _colors = {};

	protected _highlight(data: AmlParsing.Template.Token): void {
		const highlighter = new TagWithAttributeHighlight(this._decorator);
		highlighter.highlight(data.content.root);
		for (const embededView of data.content.embededViews) {
			highlighter.highlight(embededView);
		}
	}
}
