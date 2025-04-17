import {
	DataSourceMap,
	RuntimeDataSource,
	RuntimeDataSourceConfig,
} from '@arvin-shu/microcode-datasource-types';
import { promiseSettled } from '../helpers';

export const reloadDataSourceFactory =
	(
		dataSource: RuntimeDataSource,
		dataSourceMap: DataSourceMap,
		dataHandler?: (dataSourceMap: DataSourceMap) => void
	) =>
	async () => {
		const allAsyncLoadings: Array<Promise<any>> = [];

		dataSource.list
			.filter(
				(el: RuntimeDataSourceConfig) =>
					// eslint-disable-next-line implicit-arrow-linebreak
					el.type === 'urlParams' && isInit(el)
			)
			.forEach((el: RuntimeDataSourceConfig) => {
				dataSourceMap[el.id].load();
			});
		const remainRuntimeDataSourceList = dataSource.list.filter(
			(el: RuntimeDataSourceConfig) => el.type !== 'urlParams'
		);

		// 处理并行
		for (const ds of remainRuntimeDataSourceList) {
			if (!ds.options) {
				continue;
			}
			if (
				// 需要考虑出码直接不传值的情况
				isInit(ds) &&
				!ds.isSync
			) {
				allAsyncLoadings.push(dataSourceMap[ds.id].load());
			}
		}

		// 处理串行
		for (const ds of remainRuntimeDataSourceList) {
			if (!ds.options) {
				continue;
			}

			if (
				// 需要考虑出码直接不传值的情况
				isInit(ds) &&
				ds.isSync
			) {
				try {
					await dataSourceMap[ds.id].load();
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e);
				}
			}
		}
		await promiseSettled(allAsyncLoadings);

		// 所有的初始化请求都结束之后，调用钩子函数

		if (dataHandler) {
			dataHandler(dataSourceMap);
		}
	};

function isInit(ds: RuntimeDataSourceConfig) {
	return typeof ds.isInit === 'function'
		? (ds as unknown as { isInit: () => boolean }).isInit()
		: (ds.isInit ?? true);
}
