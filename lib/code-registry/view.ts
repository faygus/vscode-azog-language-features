import { IFilesRegistry } from "workspace-listener";
import { ParsingInfos } from "../parsing-manager";
import * as path from "path";

export interface ViewFileInfos {
	id: number;
	path: string;
	infos: ParsingInfos | undefined;
}

export class ViewCodeRegistry {
	private _identifiers = new Map<string, number>();
	private _counter = 2;

	constructor(private _registry: IFilesRegistry<ParsingInfos>) {

	}

	getByName(name: string): ViewFileInfos | undefined {
		console.log('getByName', name);
		const file = this._registry.files.find(file => {
			const fileName = path.parse(path.basename(file.path)).name;
			return fileName === name;
		});
		if (!file) {
			console.warn('no file with name', name);
			return undefined;
		}
		let id = this._identifiers.get(file.path);
		if (id === undefined) {
			id = ++this._counter;
			console.log('associate path', file.path, 'with id', id);
			this._identifiers.set(file.path, id);
		}
		console.log('id', id);
		return {
			id,
			path: file.path,
			infos: file.infos
		};
	}

	getIdFromPath(filePath: string): number {
		console.log('getIdFromPath', filePath);
		let id = this._identifiers.get(filePath);
		if (id === undefined) {
			id = ++this._counter;
			console.log('associate path', filePath, 'with id', id);
			this._identifiers.set(filePath, id);
		}
		return id;
	}

	getById(id: number): ViewFileInfos | undefined {
		console.log('getById', id);
		console.log('keys', Array.from(this._identifiers.keys()));
		const path = Array.from(this._identifiers.keys()).find(a => this._identifiers.get(a) === id);
		console.log('path associated', path);
		const file = this._registry.files.find(file => file.path === path);
		if (!file) return undefined;
		return {
			id,
			path: file.path,
			infos: file.infos
		};
	}
}
