/**
 * urlencoded请求参数
 */
 const _urlencoded = {}; //为了初始化的时候不执行赋值操作
 const urlencoded = new Proxy(_urlencoded, {
     get(target, key) {
         if (typeof target[key] === "object") {
             console.warn(`urlencoded不支持嵌套`);
         } else {
             return target[key];
         }
     },
     set(obj, prop, value) {
         let realValue = value;
         if (typeof value === "number") {
             console.warn(
                 `urlencoded在给 【${prop}】 字段赋值时，值不为string类型，将通过toString进行转换`
             );
             realValue = value.toString();
         } else if (typeof value !== "string") {
             console.warn(
                 `urlencoded在给 【${prop}】 字段赋值时出错，urlencoded类型只能为字符串`
             );
         }
         obj[prop] = realValue;
         self.postMessage({
             type: "prerequest-change-urlencoded",
             value: JSON.parse(JSON.stringify(urlencoded)),
         });
         return true;
     },
     deleteProperty(target, prop) {
         delete target[prop];
         self.postMessage({
             type: "prerequest-change-urlencoded",
             value: JSON.parse(JSON.stringify(urlencoded)),
         });
     },
 });
 