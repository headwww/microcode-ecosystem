import type { CompilerOptions, SourceFile } from 'ts-morph';
import { Project } from 'ts-morph';
import path from 'path';
import glob from 'fast-glob';
import consola from 'consola';
import { mkdir, writeFile } from 'fs/promises';
import chalk from 'chalk';
import { getDir, projRoot } from '../utils';

const tsConfigFilePath = path.resolve(projRoot, 'tsconfig.json');

export const buildDts = async () => {
	// TypeScript 编译器选项
	const compilerOptions: CompilerOptions = {
		// 启用复合项目
		composite: true,
		// 生成声明文件
		declaration: true,
		// 只生成声明文件
		emitDeclarationOnly: true,
		// 指定根目录
		rootDir: `${getDir()}/src`,
		// 移除 outDir 设置，防止默认输出
		// outDir: `${getDir()}/dist`, // 删除或注释掉这一行
	};

	// 创建一个新的 TypeScript 项目实例
	const project = new Project({
		// 编译器选项配置
		compilerOptions,
		// tsconfig 文件路径
		tsConfigFilePath,
		// 跳过从 tsconfig 文件中添加文件 files 和 include
		skipAddingFilesFromTsConfig: true,
	});

	const sourceFiles = await addSourceFiles(project);

	consola.success('++++++++已成功添加所有源文件到项目中');

	// 类型检查
	typeCheck(project);
	consola.success('✔✔✔✔✔✔✔✔类型检查通过！！！');

	// 生成声明文件
	const tasks = sourceFiles.map(async (sourceFile) => {
		// 获取源文件相对于项目根目录的路径
		const relativePath = path.relative(
			`${getDir()}/src`,
			sourceFile.getFilePath()
		);

		consola.trace(
			chalk.yellow(
				`Generating definition for file: ${chalk.bold(relativePath)}`
			)
		);

		// 获取源文件的输出文件
		const emitOutput = sourceFile.getEmitOutput();
		// 获取输出文件
		const emitFiles = emitOutput.getOutputFiles();
		// 如果输出文件为空，则抛出错误
		if (emitFiles.length === 0) {
			throw new Error(`Emit no file: ${chalk.bold(relativePath)}`);
		}

		// 生成 es 和 lib 文件
		const subTasks = emitFiles.map(async (outputFile) => {
			// 获取源文件相对于 src 目录的路径
			const relativePath = path.relative(
				`${getDir()}/src`,
				sourceFile.getFilePath()
			);

			// 获取文件名，不包括扩展名
			const fileName = `${path.basename(relativePath, path.extname(relativePath))}.d.ts`;

			// 获取目录路径（去除文件名）
			const dirPath = path.dirname(relativePath);

			// 计算目标输出路径
			const esDir = path.join(getDir(), 'dist/es', dirPath);
			const libDir = path.join(getDir(), 'dist/lib', dirPath);

			// 确保目标文件夹存在
			await mkdir(esDir, { recursive: true });
			await mkdir(libDir, { recursive: true });

			// 定义生成的 es 和 lib 文件路径
			const newEsFilepath = path.join(esDir, fileName);
			const newLibFilepath = path.join(libDir, fileName);

			// 写入 es 文件
			await writeFile(newEsFilepath, outputFile.getText(), 'utf8');
			// 写入 lib 文件
			await writeFile(newLibFilepath, outputFile.getText(), 'utf8');

			consola.success(
				chalk.green(
					`Definition for file: ${chalk.bold(relativePath)} generated`
				)
			);
		});

		await Promise.all(subTasks);
	});

	await Promise.all(tasks);
};

/**
 * 添加源文件
 * @param project
 * @returns
 */
async function addSourceFiles(project: Project) {
	project.addSourceFileAtPath(path.resolve(projRoot, 'typings/env.d.ts'));
	const globSourceFile = '**/*.{js?(x),ts?(x),vue}';
	const filePaths = await glob(globSourceFile, {
		cwd: `${getDir()}/src`,
		ignore: ['node_modules', 'dist', '**/*.scss'],
		absolute: true,
	});
	const sourceFiles: SourceFile[] = [];
	await Promise.all(
		filePaths.map(async (file) => {
			const sourceFile = project.addSourceFileAtPath(file);
			sourceFiles.push(sourceFile);
		})
	);
	return sourceFiles;
}

/**
 * 类型检查
 * @param project
 */
function typeCheck(project: Project) {
	// 获取项目中的所有诊断信息（类型错误、语法错误等）
	const diagnostics = project.getPreEmitDiagnostics();
	if (diagnostics.length > 0) {
		consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics));
		const err = new Error('Failed to generate dts.');
		consola.error(err);
		throw err;
	}
}
