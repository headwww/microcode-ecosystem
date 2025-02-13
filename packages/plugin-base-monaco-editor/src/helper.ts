import {
	ExtractPropTypes,
	onMounted,
	onUnmounted,
	PropType,
	ref,
	toRaw,
	watch,
} from 'vue';
import { Monaco } from '@monaco-editor/loader';
import type { editor as oEditor } from 'monaco-editor';
import { getMonaco } from './monaco';
import { DIFF_EDITOR_INITIAL_OPTIONS, INITIAL_OPTIONS } from './config';

export type IEditorInstance =
	| oEditor.IStandaloneCodeEditor
	| oEditor.IStandaloneDiffEditor;

export type EditorEnhancer = (
	monaco: Monaco,
	editorIns: IEditorInstance
) => any;

export const generalManacoEditorProps = {
	options: {
		type: Object as PropType<Record<string, any>>,
		default: {
			...INITIAL_OPTIONS,
		},
	},
	editorDidMount: Function as PropType<
		(monaco: Monaco, editor: IEditorInstance) => void
	>,
	editorWillMount: Function as PropType<(monaco: Monaco) => void>,
	path: String,
	className: String,
	saveViewState: Boolean,
	requireConfig: Object as PropType<Record<string, any>>,
	overrideServices: Object as PropType<oEditor.IEditorOverrideServices>,
	value: String,
	language: {
		type: String,
		default: 'javascript',
	},
	theme: {
		type: String,
		default: 'vs',
	},
	width: {
		type: [Number, String],
		default: '100%',
	},
	height: {
		type: [Number, String],
		default: 150,
	},
	enableOutline: {
		type: Boolean,
	},
	defaultValue: String,
	enhancers: Array as PropType<EditorEnhancer[]>,
	supportFullScreen: {
		type: Boolean,
		default: false,
	},
};

export type IGeneralManacoEditorProps = ExtractPropTypes<
	typeof generalManacoEditorProps
>;

export const useEditor = (
	type: 'single' | 'diff',
	props: IGeneralManacoEditorProps,
	emit: (event: any, ...args: any[]) => void
) => {
	const {
		overrideServices,
		value,
		defaultValue,
		language,
		path,
		requireConfig,
		options,
	} = props;

	const containerRef = ref<HTMLDivElement>();

	const focused = ref(false);

	const monacoInstance = ref<Monaco | null>(null);

	const loading = ref(false);

	const editorInstance = ref<IEditorInstance | null>(null);

	const isEditorReady = ref(false);

	const previousPath = ref(props.path);

	const viewStates = new Map<string, oEditor.ICodeEditorViewState>();

	const initializeEditor = () => {
		loading.value = true;
		getMonaco(requireConfig)
			.then((monaco: Monaco) => {
				(window as any).MonacoEnvironment = undefined;
				if (
					typeof (window as any).define === 'function' &&
					(window as any).define.amd
				) {
					delete (window as any).define.amd;
				}
				monacoInstance.value = monaco;

				try {
					props.editorWillMount?.(monaco);
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error('Monaco Editor editorWillMount error:', err);
				}

				if (!containerRef.value) return;

				let editor:
					| oEditor.IStandaloneCodeEditor
					| oEditor.IStandaloneDiffEditor;

				if (type === 'single') {
					const model = getOrCreateModel(
						monaco,
						value ?? defaultValue ?? '',
						language,
						path
					);
					editor = monaco.editor.create(
						containerRef.value!,
						{
							// 自动调整大小
							automaticLayout: true,
							...INITIAL_OPTIONS,
							...options,
						},
						overrideServices
					);
					editor.setModel(model);
				} else {
					const originalModel = monaco.editor.createModel(
						value || '',
						language
					);

					const modifiedModel = monaco.editor.createModel(
						value || '',
						language
					);

					editor = monaco.editor.createDiffEditor(
						containerRef.value,
						{
							automaticLayout: true,
							...DIFF_EDITOR_INITIAL_OPTIONS,
							...options,
						},
						overrideServices
					);

					editor.setModel({ original: originalModel, modified: modifiedModel });
				}
				editorInstance.value = editor;
				props.editorDidMount?.(monaco, editor);
				isEditorReady.value = true;
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error('Monaco Editor 加载失败:', err);
			})
			.finally(() => {
				loading.value = false;
			});
	};

	// // 监听主题变化
	watch(
		() => props.theme,
		(newTheme) => {
			if (!isEditorReady.value || !monacoInstance.value) return;
			monacoInstance.value.editor.setTheme(newTheme || 'vs');
		}
	);

	watch(
		() => props.language,
		(newLanguage) => {
			if (!isEditorReady.value || !editorInstance.value) return;
			const editor =
				type === 'diff'
					? (
							toRaw(editorInstance.value) as oEditor.IStandaloneDiffEditor
						).getModifiedEditor()
					: (toRaw(editorInstance.value) as oEditor.IStandaloneCodeEditor);
			monacoInstance.value?.editor.setModelLanguage(
				editor.getModel()!,
				newLanguage
			);
		}
	);

	watch(
		() => isEditorReady.value,
		() => {
			if (!isEditorReady.value || !editorInstance.value) return;
			const editor =
				type === 'diff'
					? (
							toRaw(editorInstance.value) as oEditor.IStandaloneDiffEditor
						).getModifiedEditor()
					: (toRaw(editorInstance.value) as oEditor.IStandaloneCodeEditor);
			editor?.onDidFocusEditorText(() => {
				focused.value = true;
			});
			editor?.onDidBlurEditorText(() => {
				focused.value = false;
			});
			editor.onDidChangeModelContent((e) => {
				const editorValue = editor?.getValue();
				emit('change', editorValue, e);
				emit('update:value', editorValue);
			});
		}
	);

	// // 监听值变化 (diff模式或无path的情况)
	watch(
		[() => isEditorReady.value, () => props.value, () => props.path],
		([ready, value, path]) => {
			if (!ready) return;
			if (type !== 'diff' && !!path) return;

			const editor =
				type === 'diff'
					? (
							toRaw(editorInstance.value) as oEditor.IStandaloneDiffEditor
						).getModifiedEditor()
					: (toRaw(editorInstance.value) as oEditor.IStandaloneCodeEditor);
			const nextValue = value ?? props.defaultValue ?? '';

			if (
				editor.getOption(monacoInstance.value?.editor.EditorOption.readOnly!)
			) {
				editor?.setValue(nextValue);
			} else if (value !== editor?.getValue()) {
				editor?.executeEdits('', [
					{
						range: editor.getModel()!.getFullModelRange(),
						text: nextValue,
						forceMoveMarkers: true,
					},
				]);
				editor?.pushUndoStop();
			}
		}
	);

	// // 多模型支持 (非diff模式)
	watch(
		[() => isEditorReady.value, () => props.value, () => props.path],
		([ready, value, path]) => {
			if (!ready || type === 'diff' || path === previousPath.value) return;

			const model = getOrCreateModel(
				monacoInstance.value!,
				value ?? props.defaultValue,
				props.language,
				path
			);

			const editor = toRaw(
				editorInstance.value
			) as oEditor.IStandaloneCodeEditor;
			if (value != null && model.getValue() !== value) {
				model.setValue(value);
			}

			if (model !== editor.getModel()) {
				if (props.saveViewState) {
					viewStates.set(previousPath.value!, editor.saveViewState()!);
				}

				editor.setModel(model);

				if (props.saveViewState) {
					const savedState = viewStates.get(path!);
					if (savedState) editor.restoreViewState(savedState);
				}
			}

			previousPath.value = path;
		}
	);

	onMounted(() => {
		initializeEditor();
	});

	onUnmounted(() => {
		toRaw(editorInstance.value)?.dispose();
	});

	return {
		loading,
		isEditorReady,
		editorInstance,
		monacoInstance,
		containerRef,
		focused,
	};
};

// 获取或创建模型的函数
function getOrCreateModel(
	monaco: Monaco, // Monaco 实例
	value?: string, // 模型的初始值
	language?: string, // 模型的语言类型
	path?: string // 模型的路径
) {
	// 如果提供了路径
	if (path) {
		// 尝试获取已有模型
		const prevModel = monaco.editor.getModel(monaco.Uri.parse(path));
		if (prevModel) {
			// 如果已有模型存在，则返回该模型
			return prevModel;
		}
	}

	// 创建新的模型并返回
	return monaco.editor.createModel(
		value || '', // 如果没有提供初始值，则使用空字符串
		language, // 使用指定的语言类型
		path && (monaco.Uri.parse(path) as any) // 如果提供了路径，则解析为 URI
	);
}
