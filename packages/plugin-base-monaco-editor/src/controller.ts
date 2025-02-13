/**
 * 编辑器元数据接口定义
 */
export interface EditorMeta {
	/** 是否为单例模式 */
	singleton: boolean;
	/** 其他任意键值对 */
	[key: string]: any;
}

/**
 * Monaco编辑器控制器类
 * 用于管理编辑器实例的方法注册和调用,以及元数据的维护
 */
export class Controller {
	/** 存储注册的方法映射 */
	private methodMap: Record<string, Function>;

	/** 存储编辑器元数据 */
	private meta: EditorMeta;

	constructor() {
		this.methodMap = {};
		this.meta = { singleton: false };
	}

	/**
	 * 注册一个方法到控制器
	 * @param name 方法名
	 * @param fn 方法实现
	 */
	registerMethod(name: string, fn: Function) {
		this.methodMap[name] = fn;
	}

	/**
	 * 调用已注册的方法
	 * @param name 方法名
	 * @param args 方法参数
	 * @returns 方法执行结果
	 */
	call(name: string, ...args: any[]) {
		return this.methodMap[name]?.(...args);
	}

	/**
	 * 更新编辑器元数据
	 * @param obj 要更新的元数据对象
	 */
	updateMeta(obj: Partial<EditorMeta>) {
		Object.assign(this.meta, obj);
	}

	/**
	 * 获取编辑器元数据的只读副本
	 * @returns 元数据对象的冻结副本
	 */
	getMeta() {
		return Object.freeze({ ...this.meta });
	}
}

/** 控制器在window对象上的唯一标识key */
const CONFIGURE_KEY = '__base_monaco_editor_controller__';
/** window对象的类型兼容处理 */
const fakeWindow: any = window;

// 确保全局只有一个Controller实例
if (!fakeWindow[CONFIGURE_KEY]) {
	fakeWindow[CONFIGURE_KEY] = new Controller();
}

/** 导出全局唯一的控制器实例 */
export const controller: Controller = fakeWindow[CONFIGURE_KEY];
