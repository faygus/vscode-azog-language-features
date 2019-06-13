export class DataStack<T> extends Array<T> {

	getFirstParentNode(): T | undefined {
		if (this.length === 0) return undefined;
		return this.slice().reverse()[0];
	}
}
