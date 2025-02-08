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
export type JSONValue = boolean | string | number | null | undefined | JSONArray | JSONObject;
export type JSONArray = JSONValue[];
export interface JSONObject {
    [key: string]: JSONValue;
}
export type CompositeValue = JSONValue | JSExpression | JSFunction | CompositeArray | CompositeObject;
export type CompositeArray = CompositeValue[];
export interface CompositeObject {
    [key: string]: CompositeValue;
}
