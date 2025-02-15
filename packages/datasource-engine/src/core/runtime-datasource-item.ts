import {
	IDataSourceRuntimeContext,
	RequestHandler,
	RuntimeDataSourceConfig,
	RuntimeDataSourceStatus,
	RuntimeOptionsConfig,
	UrlParamsHandler,
} from '@arvin-shu/microcode-datasource-types';
import { merge } from 'lodash';
import { computed, reactive, ref, shallowRef } from 'vue';

export function createDataSourceItem(
	dataSourceConfig: RuntimeDataSourceConfig,
	request: RequestHandler<{ data: any }> | UrlParamsHandler<any>,
	context: IDataSourceRuntimeContext
) {
	const data = shallowRef<unknown>({});

	const error = shallowRef<unknown>();

	const status = ref<RuntimeDataSourceStatus>(RuntimeDataSourceStatus.Initial);

	const loading = computed(
		() => status.value === RuntimeDataSourceStatus.Loading
	);

	let options: RuntimeOptionsConfig | null = null;

	async function load(params?: Record<string, unknown>) {
		if (!dataSourceConfig) return;
		// 考虑没有绑定对应的 handler 的情况
		if (!request) {
			error.value = new Error(`no ${dataSourceConfig.type} handler provide`);
			status.value = RuntimeDataSourceStatus.Error;
			throw error.value;
		}

		// urlParams的情况
		if (dataSourceConfig.type === 'urlParams') {
			const response = await (request as UrlParamsHandler<any>)(context);
			context.setState({ [dataSourceConfig.id]: response });
			data.value = response;
			status.value = RuntimeDataSourceStatus.Loaded;
			return response;
		}

		if (!dataSourceConfig.options) {
			throw new Error(`"${dataSourceConfig.id}" has no options`);
		}

		if (typeof dataSourceConfig.options === 'function') {
			options = dataSourceConfig.options();
		}

		if (!options) {
			throw new Error(`"${dataSourceConfig.id}" options transform error`);
		}

		// 临时变量存，每次可能结果不一致，不做缓存
		let shouldFetch = true;
		let fetchOptions = options;

		// 如果load存在参数则采取合并的策略合并参数，合并后再一起参与shouldFetch，willFetch的计算
		if (params) {
			fetchOptions.params = merge(fetchOptions.params, params);
		}
		// 如果配置了shouldFetch，则根据配置的函数或者布尔值来决定是否请求
		if (dataSourceConfig.shouldFetch) {
			if (typeof dataSourceConfig.shouldFetch === 'function') {
				shouldFetch = dataSourceConfig.shouldFetch(fetchOptions);
			} else if (typeof dataSourceConfig.shouldFetch === 'boolean') {
				shouldFetch = dataSourceConfig.shouldFetch;
			}
		}

		if (!shouldFetch) {
			status.value = RuntimeDataSourceStatus.Error;
			error.value = new Error(
				`the "${dataSourceConfig.id}" request should not fetch, please check the condition`
			);
			return;
		}
		// willFetch, 参数为当前options，如果load有参数，则会合并到options中的params中
		if (dataSourceConfig.willFetch) {
			try {
				fetchOptions = await dataSourceConfig.willFetch(options);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(error);
			}
		}

		const dataHandler = dataSourceConfig.dataHandler!;
		const { errorHandler } = dataSourceConfig;

		try {
			status.value = RuntimeDataSourceStatus.Loading;

			// _context 会给传，但是用不用由 handler 说了算
			const result = await (
				request as RequestHandler<{
					data: any;
				}>
			)(fetchOptions, context).then(dataHandler, errorHandler);

			// 结果赋值
			data.value = result;
			status.value = RuntimeDataSourceStatus.Loaded;

			// setState
			context.setState({
				UNSTABLE_dataSourceUpdatedAt: Date.now(),
				[dataSourceConfig.id]: result,
			});

			return data.value;
		} catch (e) {
			error.value = e as Error;
			status.value = RuntimeDataSourceStatus.Error;

			// setState
			context.setState({
				UNSTABLE_dataSourceUpdatedAt: Date.now(),
				[`UNSTABLE_${dataSourceConfig.id}_error`]: error,
			});

			throw error;
		}
	}

	return reactive({
		data,
		error,
		status,
		loading,
		load,
		isInit: dataSourceConfig.isInit,
		isSync: dataSourceConfig.isSync,
	});
}
