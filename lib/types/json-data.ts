export interface IJsonData {
	tag: string;
	attributes: {
		[key: string]: string | {[key: string]: string}
	};
	children: IJsonData[];
}
