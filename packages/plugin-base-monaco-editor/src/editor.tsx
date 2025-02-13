import { computed, defineComponent, normalizeStyle, ref, toRaw } from 'vue';
import { generalManacoEditorProps, useEditor } from './helper';
import { CollapseIcon } from './icon/collapse';
import { ExpandIcon } from './icon/expand';

export const SingleMonacoEditor = defineComponent({
	name: 'SingleMonacoEditor',
	props: generalManacoEditorProps,
	emits: ['change', 'update:value'],
	setup(props, { emit }) {
		const {
			containerRef,
			focused,
			loading,
			editorInstance: editorRef,
		} = useEditor('single', props, emit);
		const fullScreenStyle = ref({});
		const isFullScreen = ref(false);

		const className = computed(() => [
			'mtc-code-control',
			props.className,
			{
				've-focused': focused.value,
				've-outline': props.enableOutline,
			},
		]);

		const style = computed(() =>
			normalizeStyle({
				width: props.width,
				height: props.height,
			})
		);

		const toggleFullScreen = () => {
			const editorInstance = toRaw(editorRef.value);
			if (!isFullScreen.value) {
				isFullScreen.value = true;
				fullScreenStyle.value = {
					width: 'auto',
					height: 'auto',
					position: 'fixed',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 9998,
				};
				editorInstance?.updateOptions({
					// @ts-ignore
					...editorInstance.getOptions(),
					minimap: { enabled: true },
				});
			} else {
				isFullScreen.value = false;
				fullScreenStyle.value = {};
				editorInstance?.updateOptions({
					// @ts-ignore
					...editorInstance.getOptions(),
					minimap: { enabled: false },
				});
			}
			editorInstance?.layout();
		};

		return () => (
			<div class={className.value}>
				{loading.value && <span class="loading">编辑器初始化中</span>}
				<div
					ref={containerRef}
					class="mtc-code-control-container"
					style={isFullScreen.value ? fullScreenStyle.value : style.value}
				>
					{props.supportFullScreen && (
						<div
							class={{
								'mtc-monaco-full-screen': !isFullScreen.value,
								'mtc-monaco-full-screen-cancel': isFullScreen.value,
							}}
							onClick={toggleFullScreen}
						>
							{isFullScreen.value ? CollapseIcon() : ExpandIcon()}
						</div>
					)}
				</div>
			</div>
		);
	},
});
