export interface ITag {
	name: string;
}

export type IAttributes = IAttribute[];

export interface IAttribute {
	name: string;
	value: any;
}

export class ParsedTags {
	private _openedTags: ITag[] = [];

	openTag(tagName: string): void {
		this._openedTags.push({ name: tagName });
	}

	/**
	 * returns false if the closing tag doesn't match the current opened tag
	 */
	closeTag(tagName: string): boolean {
		if (this._openedTags.length === 0) {
			return false;
		}
		if (this._openedTags.slice().reverse()[0].name !== tagName) {
			return false;
		}
		this._openedTags.pop();
		return true;
	}

	closeLastTag(): boolean {
		if (this._openedTags.length === 0) {
			return false;
		}
		this._openedTags.pop();
		return true;
	}

	hasTagsOpened(): boolean {
		return this._openedTags.length > 0;
	}

	get lastOpenedTag(): ITag | undefined {
		if (this._openedTags.length === 0) {
			return undefined;
		}
		return this._openedTags.slice().reverse()[0];
	}
}
