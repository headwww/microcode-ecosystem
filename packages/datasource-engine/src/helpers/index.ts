import {
	DataHandler,
	RequestHandler,
	RequestHandlersMap,
	RuntimeDataSourceConfig,
	RuntimeOptionsConfig,
	UrlParamsHandler,
	WillFetch,
} from '@arvin-shu/microcode-datasource-types';

// 默认的 dataSourceItem 的 dataHandler
export const defaultDataHandler: DataHandler = async <T = unknown>(response: {
	data: T;
}) => response.data;

export const defaultWillFetch: WillFetch = (options: RuntimeOptionsConfig) =>
	options;

type GetRequestHandler<T = unknown> = (
	ds: RuntimeDataSourceConfig,
	requestHandlersMap: RequestHandlersMap<{ data: T }>
) => RequestHandler<{ data: T }> | UrlParamsHandler<T>;

export const getRequestHandler: GetRequestHandler = (
	ds,
	requestHandlersMap
) => {
	if (ds.type === 'custom') {
		return ds.requestHandler as unknown as RequestHandler<{ data: unknown }>;
	}
	return requestHandlersMap[ds.type || 'fetch'];
};

export const promiseSettled =
	(Promise.allSettled ? Promise.allSettled.bind(Promise) : null) ||
	((promises: Array<Promise<any>>) =>
		Promise.all(
			promises.map((p) =>
				p
					.then((v) => ({
						status: 'fulfilled',
						value: v,
					}))
					.catch((e) => ({
						status: 'rejected',
						reason: e,
					}))
			)
		));
