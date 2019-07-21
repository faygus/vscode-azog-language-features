import { IDataProvider } from "./i-data-provider";
import { IDataProviders } from "./i-data-providers";

export abstract class DataProviders implements IDataProviders {

	abstract getDataProvider(filePath: string): IDataProvider;
}
