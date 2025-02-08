"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeDataSourceStatus = void 0;
/** 数据源的状态 */
var RuntimeDataSourceStatus;
(function (RuntimeDataSourceStatus) {
    /** 初始状态，尚未加载 */
    RuntimeDataSourceStatus["Initial"] = "init";
    /** 正在加载 */
    RuntimeDataSourceStatus["Loading"] = "loading";
    /** 已加载(无错误) */
    RuntimeDataSourceStatus["Loaded"] = "loaded";
    /** 加载出错了 */
    RuntimeDataSourceStatus["Error"] = "error";
})(RuntimeDataSourceStatus || (exports.RuntimeDataSourceStatus = RuntimeDataSourceStatus = {}));
//# sourceMappingURL=data-source.js.map