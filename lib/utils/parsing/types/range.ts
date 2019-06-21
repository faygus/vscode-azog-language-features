export class Range {

	constructor(public start: number, public end: number) {

	}

	isInside(offset: number): boolean {
		return offset >= this.start && offset <= this.end;
	}
}
