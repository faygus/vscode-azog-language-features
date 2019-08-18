import * as AmlParsing from "aml-parsing";
import { BaseHighlight } from "../base-highlight";
import { TemplateHighlight } from "../template/highlight";

export class ViewFileHighlight extends BaseHighlight<AmlParsing.ViewFile.Token> {

	protected _colors = {
	};

	protected _highlight(data: AmlParsing.ViewFile.Token): void {
		// TODO data.content.properties
		const highlighter = new TemplateHighlight(this._decorator);
		highlighter.highlight(data.content.viewTemplate);
	}
}
