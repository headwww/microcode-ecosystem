import { IRuntimeDataSource } from './data-source';
import { CustomRequestHandler } from './data-source-handlers';

export interface RuntimeDataSource {
	list: RuntimeDataSourceConfig[];
	dataHandler?: (dataSourceMap: DataSourceMap) => void;
}

export interface IDataSourceRuntimeContext<TState = Record<string, unknown>> {
	state: TState;
	setState(state: TState): void;
	forceUpdate(): void;
}

export type RuntimeOptions = () => RuntimeOptionsConfig;

export interface RuntimeDataSourceConfig {
	id: string;
	/**
	 * 是否为初始数据
	 */
	isInit?: boolean;
	/**
	 * 是否需要串行执行
	 */
	isSync?: boolean;
	/**
	 * 数据请求类型
	 */
	type?: string;
	/**
	 * 单个数据结果请求参数处理函数
	 */
	willFetch?: WillFetch;
	/**
	 * 本次请求是否可以正常请求
	 * @param options
	 * @returns
	 */
	shouldFetch?: (options: RuntimeOptionsConfig) => boolean;
	/**
	 * 自定义扩展的外部请求处理器
	 */
	requestHandler?: CustomRequestHandler;
	/**
	 * request 成功后的回调函数
	 */
	dataHandler?: DataHandler;
	/**
	 * request 失败后的回调函数
	 */
	errorHandler?: ErrorHandler;
	/**
	 * 请求参数
	 */
	options?: RuntimeOptions;
	[otherKey: string]: unknown;
}

export type ErrorHandler = (err: unknown) => Promise<any>;

export type WillFetch = (
	options: RuntimeOptionsConfig
) => Promise<RuntimeOptionsConfig> | RuntimeOptionsConfig;

export interface RuntimeOptionsConfig {
	uri: string;
	api?: string;
	params?: Record<string, unknown>;
	method?: string;
	isCors?: boolean;
	timeout?: number;
	headers?: Record<string, unknown>;
	[option: string]: unknown;
}

export type DataHandler = <T>(response: {
	data: T;
	[index: string]: unknown;
}) => Promise<T | undefined>;

export type DataSourceMap = Record<string, IRuntimeDataSource>;
