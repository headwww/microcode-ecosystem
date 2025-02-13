<script setup lang="ts">
import { ref } from 'vue';

const theme = ref('vs'); // 默认主题
const codeValue = ref("console.log('Hello, World!');"); // 动态代码值

const toggleTheme = () => {
	theme.value = theme.value === 'vs' ? 'vs-dark' : 'vs'; // 切换主题
};

function changeCodeValue() {
	codeValue.value = 'console.log("Hello, World111111!");';
}
const language = ref('javascript');

function changeLanguage() {
	language.value = 'css';
}
</script>

<template>
	<div>
		<button @click="toggleTheme">切换主题</button>
		<button @click="changeCodeValue">切换值</button>
		<button @click="changeLanguage">切换语言</button>
		<!--	<SingleMonacoEditor
			v-model:value="codeValue"
			:language="language"
			:theme="theme"
			:support-full-screen="true"
			:require-config="{
				paths: {
					vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.31.1/min/vs',
				},
			}"
		/>
		--></div>
</template>
