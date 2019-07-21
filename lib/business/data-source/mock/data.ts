import { IDataProvider } from "../i-data-provider";
import * as azog from "azog";

const PIPES: azog.Models.IPipeInterface[] = [
	{
		name: 'pipeA',
		argumentType: 'string',
		resultType: 'number'
	},
	{
		name: 'pipeB',
		argumentType: 'number',
		resultType: 'string'
	},
	{
		name: 'pipeC',
		argumentType: 'boolean',
		resultType: 'number'
	},
	{
		name: 'pipeD',
		argumentType: 'string',
		resultType: 'number'
	},
];

export const DATA: {[key: number]: IDataProvider} = {
	1: {
		properties: [
			{
				name: 'variable1',
				type: 'string'
			},
			{
				name: 'variable2',
				type: 'number'
			},
			{
				name: 'variable3',
				type: 'boolean'
			},
		],
		pipes: PIPES
	},
	2: {
		properties: [
			{
				name: 'myVariable1',
				type: 'string'
			},
			{
				name: 'myVariable2',
				type: 'number'
			}
		],
		pipes: PIPES
	},
};
