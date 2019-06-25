import { TextRange } from "../types";

export class AmlDiagnosticData {
	position: TextRange;

	constructor(position: TextRange | number,
		public message: string,
		public severity: "error" | "warning" | "info" | "hint") {
		if (position instanceof TextRange) {
			this.position = position;
		} else {
			this.position = new TextRange(position, position);
		}
	}
}
