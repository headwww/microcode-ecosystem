import loader, { Monaco } from '@monaco-editor/loader';
import isEqual from 'lodash/isEqual';
import { controller, EditorMeta } from './controller';

export const getSingletonMonaco = (() => {
	let monaco: Monaco;
	let prevOptions: any;
	return async (options?: any) => {
		if (!monaco || !isEqual(prevOptions, options)) {
			const hasConfig = Object.keys(options || {}).length > 0;
			loader.config(
				hasConfig
					? options
					: {
							paths: {
								vs: 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs',
							},
						}
			);
			monaco = await loader.init();
			prevOptions = options;
		}
		return monaco;
	};
})();

export const getCommonMonaco = (config: any): Promise<Monaco> => {
	if (config) {
		loader.config(config);
	} else {
		loader.config({
			paths: {
				vs: 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs',
			},
		});
	}
	return loader.init();
};

export function getMonaco(config?: any) {
	const hasConfig = Object.keys(config || {}).length > 0;
	const monacoConfig = hasConfig ? config : undefined;
	return controller.getMeta().singleton
		? getSingletonMonaco(monacoConfig)
		: getCommonMonaco(monacoConfig);
}

export function configure(config: EditorMeta) {
	controller.updateMeta(config);
}
