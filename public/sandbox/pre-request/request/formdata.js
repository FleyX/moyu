/**
 * formdata请求参数
 */
const _formdata = {}; //为了初始化的时候不执行赋值操作
const formdata = new Proxy(_formdata, {
    get(target, key) {
        if (typeof target[key] === "object") {
            console.warn(`formdata不支持嵌套`);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        let realValue = value;
        if (typeof value === "number") {
            console.warn(
                `formdata在给 【${prop}】 字段赋值时，值不为string类型，将通过toString进行转换`
            );
            realValue = value.toString();
        } else if (typeof value !== "string") {
            console.warn(
                `formdata在给 【${prop}】 字段赋值时出错，formdata类型只能为字符串`
            );
        }
        obj[prop] = realValue;
        self.postMessage({
            type: "prerequest-change-formdata",
            value: JSON.parse(JSON.stringify(formdata)),
        });
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "prerequest-change-formdata",
            value: JSON.parse(JSON.stringify(formdata)),
        });
    },
});
