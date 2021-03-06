import * as vscode from 'vscode';

export class XmlCompleteSettings {
	schemaMapping: { xmlns: string, xsdUri: string, strict: boolean }[];
	formattingStyle: "singleLineAttributes" | "multiLineAttributes" | "fileSizeOptimized";
}

export class CompletionString {

	constructor(public name: string, public comment?: string) {
	}
}

export class XmlTag {
	tag: CompletionString;
	base: string[];
	attributes: Array<CompletionString>; // TODO change the type to consider type and use
	visible: boolean;
}

export class XmlTagCollection extends Array<XmlTag> {
	loadAttributes(tagName: string | undefined): CompletionString[] {
		let result: CompletionString[] = [];
		if (tagName !== undefined) {
			let currentTags = this.filter(e => e.tag.name === tagName);
			if (currentTags.length > 0) {
				result.push(...currentTags.map(e => e.attributes).reduce((prev, next) => prev.concat(next), []));
				currentTags.forEach(e => e.base.forEach(b => result.push(...this.loadAttributes(b))));
			}
		}
		return result;
	}
}

export class XmlSchemaProperties {
	schemaUri: vscode.Uri;
	xsdContent: string;
	tagCollection: XmlTagCollection;
}

export class XmlSchemaPropertiesArray extends Array<XmlSchemaProperties> {
	filterUris(uris: vscode.Uri[]): Array<XmlSchemaProperties> {
		return this.filter(e => uris
			.find(u => u.toString() === e.schemaUri.toString()) !== undefined);
	}

	get(uri: vscode.Uri): XmlSchemaProperties | undefined {
		return this.find(e => uri.toString() === e.schemaUri.toString());
	}
}

export class XmlDiagnosticData {
	position: TextRange;

	constructor(position: TextRange | TextPosition,
		public message: string,
		public severity: "error" | "warning" | "info" | "hint") {
		if (position instanceof TextRange) {
			this.position = position;
		} else {
			this.position = new TextRange(position, position);
		}
	}
}

export class XmlScope {
	tagName: string | undefined;
	context: "element" | "attribute" | "text" | undefined;
}

export class TextPosition {
	constructor(public line: number, public column: number) {

	}
}

export class TextRange {
	constructor(public start: TextPosition, public end: TextPosition) {

	}
}
