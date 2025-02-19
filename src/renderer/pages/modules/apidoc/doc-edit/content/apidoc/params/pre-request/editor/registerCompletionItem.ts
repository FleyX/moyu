import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

type Suggestions = {
    label: {
        label: string,
        description: string
    },
    kind: monaco.languages.CompletionItemKind,
    insertText: string,
    keyword: string,
    sortText?: string
}[]

const variableSuggestions = [{
    label: {
        label: "variables",
        description: "临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "variables",
    sortText: "1",
    keyword: "pm.variables",
}, {
    label: {
        label: "get",
        description: "获取单个临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    keyword: "pm.variables.get",
}, {
    label: {
        label: "set",
        description: "设置临时变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    keyword: "pm.variables.set",
}, {
    label: {
        label: "update",
        description: "更新临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    keyword: "pm.variables.update",
}, {
    label: {
        label: "upsert",
        description: "更新临时变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    keyword: "pm.variables.upsert",
}, {
    label: {
        label: "has",
        description: "判断临时变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    keyword: "pm.variables.has",
}, {
    label: {
        label: "unset",
        description: "删除临时变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    keyword: "pm.variables.unset",
}, {
    label: {
        label: "delete",
        description: "删除临时变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    keyword: "pm.variables.delete",
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出临时变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    keyword: "pm.variables.toObject",
}]
const collectionVariableSuggestions = [{
    label: {
        label: "collectionVariables",
        description: "集合内变量(跨接口使用)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "collectionVariables",
    sortText: "2",
    keyword: "pm.collectionVariables",
}, {
    label: {
        label: "get",
        description: "获取单个变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `get("变量名称")`,
    sortText: "1",
    keyword: "pm.collectionVariables.get",
}, {
    label: {
        label: "set",
        description: "设置变量值"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `set("变量名称", "变量值")`,
    sortText: "2",
    keyword: "pm.collectionVariables.set",
}, {
    label: {
        label: "update",
        description: "更新变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `update("变量名称", "变量值")`,
    sortText: "3",
    keyword: "pm.collectionVariables.update",
}, {
    label: {
        label: "upsert",
        description: "更新变量(不存在则新增)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `upsert("变量名称", "变量值")`,
    sortText: "4",
    keyword: "pm.collectionVariables.upsert",
}, {
    label: {
        label: "has",
        description: "判断变量是否存在"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `has("变量名称")`,
    keyword: "pm.collectionVariables.has",
}, {
    label: {
        label: "unset",
        description: "删除变量值(同delete)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `unset("变量名称")`,
    keyword: "pm.collectionVariables.unset",
}, {
    label: {
        label: "delete",
        description: "删除变量值(同unset)"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: `delete("变量名称")`,
    keyword: "pm.collectionVariables.delete",
}, {
    label: {
        label: "toObject",
        description: "以对象形式输出变量"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "toObject",
    keyword: "pm.collectionVariables.toObject",
}]
const requestSuggestions = [{
    label: {
        label: "request",
        description: "全局请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: "request",
    sortText: "3",
    keyword: "pm.request",
}, {
    label: {
        label: "url",
        description: "请求url信息(prefix、path、url)"
    },
    sortText: "a",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: "url",
    keyword: "pm.request.url",
}, {
    label: {
        label: "prefix",
        description: "请求前缀"
    },
    sortText: "1",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "prefix",
    keyword: "pm.request.url.prefix",
}, {
    label: {
        label: "path",
        description: "请求路径"
    },
    sortText: "2",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "path",
    keyword: "pm.request.url.path",
}, {
    label: {
        label: "url",
        description: "完整请求路径"
    },
    sortText: "3",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "url",
    keyword: "pm.request.url.url",
}, {
    label: {
        label: "headers",
        description: "请求头"
    },
    sortText: "3c",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `headers`,
    keyword: "pm.request.headers",
}, {
    label: {
        label: "queryParams",
        description: "请求query参数"
    },
    sortText: "d",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `queryParams`,
    keyword: "pm.request.queryParams",
}, {
    label: {
        label: "pathParams",
        description: "请求path参数"
    },
    sortText: "e",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: "pathParams",
    keyword: "pm.request.pathParams",
}, {
    label: {
        label: "body",
        description: "请求body参数"
    },
    sortText: "f",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `body`,
    keyword: "pm.request.body",
}, {
    label: {
        label: "json",
        description: "json参数"
    },
    sortText: "1",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `json`,
    keyword: "pm.request.body.json",
}, {
    label: {
        label: "formdata",
        description: "formdata参数"
    },
    sortText: "2",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `formdata`,
    keyword: "pm.request.body.formdata",
}, {
    label: {
        label: "urlencoded",
        description: "urlencoded参数"
    },
    sortText: "3",
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: `urlencoded`,
    keyword: "pm.request.body.urlencoded",
}, {
    label: {
        label: "raw",
        description: "raw参数"
    },
    sortText: "4",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `raw`,
    keyword: "pm.request.body.raw",
}, {
    label: {
        label: "method",
        description: "请求方法(GET|POST|PUT...)"
    },
    sortText: "g",
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: "method",
    keyword: "pm.request.method",
}, {
    label: {
        label: "envs",
        description: "所有环境信息"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `envs`,
    sortText: "h",
    keyword: "pm.request.envs",
}, {
    label: {
        label: "currentEnv",
        description: "当前环境"
    },
    kind: monaco.languages.CompletionItemKind.Property,
    insertText: `currentEnv`,
    sortText: "i",
    keyword: "pm.request.currentEnv",
}, {
    label: {
        label: "replaceUrl",
        description: "替换url(最终发送替换后的url)"
    },
    sortText: "j",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `replaceUrl("替换后的url eg:https://www.baidu.com")`,
    keyword: "pm.request.replaceUrl",
}, {
    label: {
        label: "sendRequest",
        description: "发送请求"
    },
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: `sendRequest("请求url", (err, response) => {})`,
    keyword: "pm.sendRequest",
}]

const suggestions: Suggestions = [{
    label: {
        label: "pm",
        description: "全局对象"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "pm",
    keyword: "pm",
},
{
    label: {
        label: "console",
        description: "控制台输出"
    },
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: "console.log()",
    keyword: "console",
},
...variableSuggestions,
...collectionVariableSuggestions,
...requestSuggestions]

export function useCompletionItem(): monaco.IDisposable {
    return monaco.languages.registerCompletionItemProvider("javascript", {
        triggerCharacters: [".", "("],
        provideCompletionItems(model, position) {
            const currentLineStr = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 0,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });
            const lineStrArr = currentLineStr.replace("\t", "").split(" ");
            const activeStr = lineStrArr[lineStrArr.length - 1];
            const matchedSuggestions = suggestions.filter(v => {
                const replacedStr = activeStr.replace(/^[^(]+\(\s*/, "")
                const activeStrArr = replacedStr.split(".");
                const keywordArr = v.keyword.split(".");
                for (let i = 0; i < activeStrArr.length - 1; i += 1) {
                    if (activeStrArr[i] !== keywordArr[i]) {
                        return false;
                    }
                }
                if (activeStrArr.length < keywordArr.length) return false;
                // console.log(v.keyword, activeStr)
                const matchedTrigger = v.keyword.includes(replacedStr);
                return matchedTrigger
            });
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            const result: monaco.languages.CompletionItem[] = matchedSuggestions.map(v => {
                const data = {
                    label: v.label,
                    kind: v.kind,
                    insertText: v.insertText,
                    range,
                    sortText: v.sortText || v.label.label,
                    preselect: true
                }
                return data;
            })
            return {
                suggestions: result
            };
        }
    })
}
