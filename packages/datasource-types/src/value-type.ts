// 表达式接口，表示一个 JavaScript 表达式
export interface JSExpression {
	type: 'JSExpression';
	/**
	 * 表达式的字符串表示形式
	 */
	value: string;
	/**
	 * 可选的模拟值，用于测试或占位
	 */
	mock?: any;
	/**
	 * 编译后的源码，便于调试和分析
	 */
	compiled?: string;
}

// 函数接口，表示一个 JavaScript 函数
export interface JSFunction {
	type: 'JSFunction';
	/**
	 * 函数的字符串表示形式
	 */
	value: string;
}

/**
 * 事件函数类型接口，表示一个可以被调用的事件处理函数
 */
export interface JSFunction {
	type: 'JSFunction';

	/**
	 * 函数的定义，可以是函数声明或直接的函数表达式
	 */
	value: string;

	/**
	 * 编译后的源码，便于调试和分析
	 */
	compiled?: string;
}

// 函数接口，表示一个 JavaScript 函数
export interface JSFunction {
	type: 'JSFunction';
	/**
	 * 函数的字符串表示形式
	 */
	value: string;
	/**
	 * 可选的模拟值，用于测试或占位
	 */
	mock?: any;
	/**
	 * 额外的扩展属性，可以包含如 extType、events 等信息
	 */
	[key: string]: any;
}

// JSON 基本类型，表示可以在 JSON 中使用的所有基本数据类型
export type JSONValue =
	| boolean
	| string
	| number
	| null
	| undefined
	| JSONArray
	| JSONObject;
export type JSONArray = JSONValue[];
export interface JSONObject {
	[key: string]: JSONValue;
}

// 复合类型，表示可以包含多种类型的值
export type CompositeValue =
	| JSONValue
	| JSExpression
	| JSFunction
	// | JSSlot // 后续这里应该要再提取一个 base types
	| CompositeArray
	| CompositeObject;
export type CompositeArray = CompositeValue[];
export interface CompositeObject {
	[key: string]: CompositeValue;
}
