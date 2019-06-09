import { PropertyType } from "../types";

export const controlWFStyle: PropertyType = {
	color: {
		type: ['WHITE', 'GRAY', 'DARK'],
		comment: 'color of the control'
	},
	size: {
		type: ['Small', 'Medium', 'High'],
		comment: 'size of the control'
	} // TODO
}
