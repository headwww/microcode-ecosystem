import * as Vue from 'vue';
import { createDataSourceEngine } from '@arvin-shu/microcode-datasource-engine';
import { RuntimeOptionsConfig } from '@arvin-shu/microcode-datasource-types';
import axios from 'axios';
import qs from 'query-string';
import App from './App.vue';

import './rest.scss';

window.Vue = Vue;
const app = Vue.createApp(App);

const { dataSourceMap, reloadDataSource } = createDataSourceEngine(
	{
		list: [
			{
				type: 'urlParams',
				id: 'urlParams',
				uri: 'https://api.github.com/users/octocat',
			},
			{
				id: 'info',
				isInit: true,
				isSync: false,
				type: 'axios',
				options: {
					uri: 'https://jsonplaceholder.typicode.com/posts',
					method: 'GET',
				},
			},
		],
		dataHandler: undefined,
	},
	{
		state: {},
		setState: () => {},
		forceUpdate: () => {},
	},
	{
		requestHandlersMap: {
			axios: createAxiosFetchHandler(),
			urlParams: createUrlParamsHandler(),
		},
	}
);
reloadDataSource();
console.log(dataSourceMap);

function createUrlParamsHandler<T = unknown>(searchString: string | T = '') {
	// eslint-disable-next-line space-before-function-paren
	return async function (): Promise<T> {
		if (typeof searchString === 'string') {
			const params = qs.parse(searchString) as unknown as T;
			return params;
		}

		return searchString;
	};
}

function createAxiosFetchHandler(config?: Record<string, unknown>) {
	return async function (options: RuntimeOptionsConfig) {
		const requestConfig = {
			...options,
			url: options.uri,
			method: options.method,
			data: options.params,
			headers: options.headers,
			...config,
		};
		const response = await axios(requestConfig as any);
		return response;
	};
}

app.mount('#app');
