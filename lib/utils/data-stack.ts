export class DataStack<T> {

	private _array: Array<T> = [];

	constructor() {
	}

	getFirstParentNode(): T | undefined {
		if (this._array.length === 0) return undefined;
		return this._array.slice().reverse()[0];
	}

	push(element: T): void {
		this._array.push(element);
	}

	pop(): void {
		this._array.pop();
	}
}
