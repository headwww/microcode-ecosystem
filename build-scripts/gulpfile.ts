import { series, parallel } from 'gulp';
import { mkdir, rm, copyFile } from 'fs/promises';
import { getDir, outputRoot, runTask, withTaskName } from './src';

/**
 * 复制描述文件
 */
export const copyDescriptions = async () => {
	Promise.all([
		copyFile(`${getDir()}/package.json`, `${getDir()}/dist/package.json`),
	]);
};

export default series(
	withTaskName('初始化', async () => {
		try {
			await rm(outputRoot, { recursive: true, force: true });
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}
	}),
	withTaskName('创建输出目录', () => mkdir(outputRoot, { recursive: true })),
	parallel(
		runTask('buildModules'),
		runTask('buildTheme'),
		runTask('buildUmd'),
		runTask('buildDts')
	),
	parallel(runTask('copyDescriptions'))
);

export * from './src';
