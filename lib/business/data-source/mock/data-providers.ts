import { DataProvider } from "../data-provider";
import { DataProviders } from "../data-providers";
import { IDataProvider } from "../i-data-provider";
import { DATA } from "./data";

export class MockDataProviders extends DataProviders {
	private _counter = 0;
	private _dataProviders = new Map<string, IDataProvider>();

	getDataProvider(filePath: string): IDataProvider {
		const data = this._dataProviders.get(filePath);
		if (data) return data;
		const key = ++this._counter;
		let value = DATA[key];
		if (!value) {
			value = new DataProvider();
		}
		this._dataProviders.set(filePath, value);
		return value;
	}
}
