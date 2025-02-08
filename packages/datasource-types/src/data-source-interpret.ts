import {
	CompositeValue,
	JSExpression,
	JSFunction,
	JSONObject,
} from './value-type';

export interface InterpretDataSource {
	list: InterpretDataSourceConfig[];
	dataHandler?: JSFunction;
}

export interface InterpretDataSourceConfig {
	id: string;
	isInit?: boolean | JSExpression;
	isSync?: boolean | JSExpression;
	type?: string;
	requestHandler?: JSFunction;
	dataHandler?: JSFunction;
	errorHandler?: JSFunction;
	willFetch?: JSFunction;
	shouldFetch?: JSFunction;
	options?: {
		uri: string | JSExpression;
		api?: string | JSExpression;
		params?: JSONObject | JSExpression;
		method?: string | JSExpression;
		isCors?: boolean | JSExpression;
		timeout?: number | JSExpression;
		headers?: JSONObject | JSExpression;
		[option: string]: CompositeValue;
	};
	[otherKey: string]: CompositeValue;
}
