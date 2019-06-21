import { CodeUnit } from "./code-unit";

export class CodeSequence {
	private _codeUnits: CodeUnit[] = [];

	constructor(codeUnits?: CodeUnit[]) {
		if (codeUnits) {
			this._codeUnits = codeUnits;
		}
	}

	add(codeUnit: CodeUnit): void {
		this._codeUnits.push(codeUnit);
	}

	get last(): CodeUnit | undefined {
		if (this._codeUnits.length === 0) {
			return undefined;
		}
		return this._codeUnits.slice().reverse()[0];
	}

	getCodeUnit(offset: number): CodeUnit | undefined {
		for (const codeUnit of this._codeUnits) {
			if (codeUnit.range.isInside(offset)) {
				return codeUnit;
			}
			if (offset < codeUnit.range.start) {
				return undefined;
			}
		}
	}
}
