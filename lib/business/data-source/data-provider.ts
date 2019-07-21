import { IDataProvider } from "./i-data-provider";
import * as azog from "azog";
import { Subject, Observable } from "rxjs";

export class DataProvider implements IDataProvider {
	properties: azog.Models.IVariable[];
	pipes: azog.Models.IPipeInterface[];
	private _changed = new Subject<void>();

	triggerChange(): void {
		this._changed.next();
	}

	get changed(): Observable<void> {
		return this._changed.asObservable();
	}
}
