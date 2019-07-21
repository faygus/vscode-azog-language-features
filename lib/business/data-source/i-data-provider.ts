import * as azog from "azog";

/**
 * expose the properties names and pipes available for a view
 */
export interface IDataProvider {
	readonly properties: azog.Models.IVariable[];
	readonly pipes: azog.Models.IPipeInterface[];
}
