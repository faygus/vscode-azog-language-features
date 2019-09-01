import * as azog from "azog";
import { IFilesRegistry } from "workspace-listener";
import { IParser, ParsingInfos } from "./parsing-manager";

export interface IGlobalFilesRegistry {
	views: IFilesRegistry<ParsingInfos>;
	pipes: IFilesRegistry<azog.Models.IPipeInterface>;
}

export interface IProvider {
	registerParser(parser: IParser): void;
	getFileViewSelector(path: string): boolean;
	fileRegistry: IGlobalFilesRegistry;
}
