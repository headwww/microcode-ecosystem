import {
	DataHandler,
	IDataSourceRuntimeContext,
	InterpretDataSource,
	RequestHandlersMap,
	RuntimeDataSourceConfig,
} from '@arvin-shu/microcode-datasource-types';
import { adapt2Runtime } from './adapter';
import { createDataSourceItem } from './runtime-datasource-item';
import { getRequestHandler } from '../helpers';
import { reloadDataSourceFactory } from './reload-datasource-factory';

export function createDataSourceEngine(
	dataSource: InterpretDataSource,
	context: IDataSourceRuntimeContext,
	extraConfig: {
		requestHandlersMap: RequestHandlersMap<{ data: unknown }>;
		defaultDataHandler?: DataHandler;
	} = { requestHandlersMap: {} }
) {
	const { requestHandlersMap } = extraConfig;

	const runtimeDataSource = adapt2Runtime(dataSource, context, {
		defaultDataHandler: extraConfig.defaultDataHandler,
	});

	const dataSourceMap = runtimeDataSource.list.reduce(
		(prev: Record<string, any>, cur: RuntimeDataSourceConfig) => {
			prev[cur.id] = createDataSourceItem(
				cur,
				getRequestHandler(cur, requestHandlersMap),
				context
			);
			return prev;
		},
		{}
	);

	return {
		dataSourceMap,
		reloadDataSource: reloadDataSourceFactory(
			runtimeDataSource,
			dataSourceMap,
			runtimeDataSource.dataHandler
		),
	};
}
