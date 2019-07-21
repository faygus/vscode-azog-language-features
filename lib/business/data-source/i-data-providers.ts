import { IDataProvider } from "./i-data-provider";

export interface IDataProviders {
	getDataProvider(filePath: string): IDataProvider;
}
