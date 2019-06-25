import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as vscode from 'vscode';

const defaultDelay = 500;

export class EditorEventListener implements vscode.Disposable {
	private _listeners: vscode.Disposable[] = [];
	private _disposed$: Subject<void> = new Subject();

	constructor() {
	}

	public dispose() {
		for (const listener of this._listeners) {
			listener.dispose();
		}
		this._disposed$.next();
	}

	protected listen<T>(listenerRegister: ListenerRegister<T>,
		handler: (data: T) => void, delay: number = defaultDelay): void {
		const subject$ = new Subject<T>();
		const listener = listenerRegister(arg => {
			subject$.next(arg);
		});
		this._listeners.push(listener);
		subject$.asObservable().pipe(
			debounceTime(delay),
			takeUntil(this._disposed$)
		).subscribe(data => {
			handler(data);
		});
	}
}

type ListenerRegister<T> = (data: ((arg: T) => void)) => vscode.Disposable;
