/*
    创建者：shuxiaokai
    创建时间：2021-09-28 22:00
    模块名称：导入文档
    备注：
*/
<template>
    <div class="doc-import">
        <!-- 文件选择 -->
        <!-- <s-fieldset title="支持：Yapi、Postman、摸鱼文档、Swagger/OpenApi 3.0"> -->
        <s-fieldset :title="$t('支持：摸鱼文档、Swagger/OpenApi 3.0/Postman2.1')">
            <el-upload
                class="w-100"
                drag
                action=""
                :show-file-list="false"
                :before-upload="handleBeforeUpload"
                :http-request="requestHook"
            >
                <el-icon :size="20">
                    <Upload />
                </el-icon>
                <div class="el-upload__text">{{ $t("将文件拖到此处，或") }}<em>{{ $t("点击上传") }}</em></div>
                <template #tip>
                    <div class="mt-2">
                        <div v-if="importTypeInfo.name" class="orange">
                            <span>{{ $t("文档类型") }}：</span>
                            <span>{{ importTypeInfo.name }}</span>
                            <span v-if="importTypeInfo.version">({{ importTypeInfo.version }})</span>
                        </div>
                    </div>
                </template>
            </el-upload>
        </s-fieldset>
        <!-- 导入数据预览 -->
        <s-fieldset :title="$t('导入数据预览')">
            <div>
                <s-label-value :label="`${$t('文档数')}：`" label-width="auto" class="mr-4">{{ formInfo.moyuData.docs.filter((v) => !v.isFolder).length }}</s-label-value>
                <s-label-value :label="`${$t('文件夹数')}：`" label-width="auto">{{ formInfo.moyuData.docs.filter((v) => v.isFolder).length }}</s-label-value>
            </div>
            <el-tree
                ref="docTree"
                :data="previewNavTreeData"
                node-key="_id"
                :expand-on-click-node="true"
            >
                <template #default="scope">
                    <div
                        class="custom-tree-node"
                        tabindex="0"
                    >
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <template v-for="(req) in projectInfo.rules.requestMethods">
                                <span v-if="scope.data.item.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <div class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.info.name" :value="scope.data.info.name"></s-emphasize>
                            </div>
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                            <div class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.info.name" :value="scope.data.info.name"></s-emphasize>
                            </div>
                        </template>
                    </div>
                </template>
            </el-tree>
        </s-fieldset>
        <!-- 额外配置信息 -->
        <s-fieldset v-if="!importAsProject" :title="$t('额外配置')">
            <div>
                <s-config
                    v-if="formInfo.type === 'openapi' || formInfo.type === 'swagger'"
                    :has-check="false"
                    :label="$t('文件夹命名方式')"
                    :description="$t('none代表不存在文件夹，所有节点扁平放置')"
                >
                    <el-radio-group v-model="openapiFolderNamedType" @change="handleChangeNamedType">
                        <el-radio label="tag">Tag</el-radio>
                        <el-radio label="url">Url</el-radio>
                        <el-radio label="none">none</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config :has-check="false" label="导入方式" :description="$t('请谨慎选择导入方式')">
                    <el-radio-group v-model="formInfo.cover" @change="handleChangeIsCover">
                        <el-radio :label="false">{{ $t("追加方式") }}</el-radio>
                        <el-radio :label="true">{{ $t("覆盖方式") }}</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config :label="$t('目标目录')" :description="$t('选择需要挂载的节点，不选择则默认挂载到根目录')" @change="handleToggleTargetFolder">
                    <template #default="prop">
                        <s-loading :loading="loading2">
                            <div v-show="prop.enabled" class="doc-nav">
                                <el-tree
                                    ref="docTree2"
                                    :data="navTreeData"
                                    node-key="_id"
                                    show-checkbox
                                    :expand-on-click-node="true"
                                    :check-strictly="true"
                                    @check="handleCheckChange"
                                >
                                    <template #default="scope">
                                        <div
                                            class="custom-tree-node"
                                            tabindex="0"
                                        >
                                            <!-- 文件夹渲染 -->
                                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
                                            <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                                        </div>
                                    </template>
                                </el-tree>
                            </div>
                        </s-loading>
                    </template>
                </s-config>
            </div>
            <div class="d-flex j-center mt-2">
                <el-button :loading="loading" type="primary" @click="handleSubmit">{{ $t("确定导入") }}</el-button>
            </div>
        </s-fieldset>
        <!-- <template v-if="importAsProject">
            <el-form ref="form" :model="formInfo" label-width="80px" class="mt-3">
                <el-form-item label="项目名称">
                    <el-input v-model="projectName" name="name" placeholder="请输入项目名称" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
            </el-form>
            <div class="d-flex j-center mt-2">
                <el-button :loading="loading" type="primary" @click="handleSubmitAsProject">确定导入</el-button>
            </div>
        </template> -->
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed } from "vue"
import jsyaml from "js-yaml"
import type { OpenAPIV3 } from "openapi-types";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload } from "@element-plus/icons-vue"
import type { ApidocDetail } from "@@/global"
import type { ApidocProjectRules } from "@@/store"
import config from "@/../config/config"
import { store } from "@/store/index";
import { router } from "@/router/index"
import { axios } from "@/api/api"
import { $t } from "@/i18n/i18n"
import { TreeNodeOptions } from "element-plus/lib/components/tree/src/tree.type"
import OpenApiTranslator from "./openapi";
import PostmanTranslator from "./postman";

type FormInfo = {
    moyuData: {
        hosts?: {
        _id: string,
        url: string,
        name: string,
    }[],
        docs: (ApidocDetail & { children?: ApidocDetail[] })[]
    },
    type: string,
    cover: boolean
}

type MoyuInfo = {
    type: string,
    rules: ApidocProjectRules[],
    docs: ApidocDetail[],
    hosts: {
        _id: string,
        url: string,
        name: string,
    }[],
    info: {
        projectName: string,
    }
};

/*
|--------------------------------------------------------------------------
| 基本数据信息
|--------------------------------------------------------------------------
|
*/
defineProps({
    //是否直接导出为项目
    importAsProject: {
        type: Boolean,
        default: false,
    }
})
const projectId = router.currentRoute.value.query.id as string;
//目标树
const docTree2: Ref<TreeNodeOptions["store"] | null> = ref(null);
//按钮加载效果
const loading = ref(false);
//目标节点菜单
const loading2 = ref(false);
//项目基本信息
const projectInfo = computed(() => store.state["apidoc/baseInfo"]);
//openapi文件夹格式
const openapiFolderNamedType: Ref<"tag" | "url" | "none"> = ref("tag");
const formInfo: Ref<FormInfo> = ref({
    moyuData: {
        docs: [],
    },
    type: "",
    cover: false,
});
const importTypeInfo = ref({
    name: "",
    version: "",
});
const jsonText: Ref<OpenAPIV3.Document | string | { type: string }> = ref("");
const fileType = ref("");
const navTreeData = ref([]);
const currentMountedNode: Ref<ApidocDetail | null> = ref(null);
/*
|--------------------------------------------------------------------------
| 文件选择
|--------------------------------------------------------------------------
|
*/
//检查文件格式和文件大小
const handleBeforeUpload = (file: File) => {
    const standerFileType = file.type; //标准类型
    const matchSuffix = file.name.match(/(?<=\.)[^.]+$/); //根据后缀获取类型
    const suffixFileType = matchSuffix ? matchSuffix[0] : "";
    fileType.value = standerFileType || suffixFileType;
    if (!standerFileType && !suffixFileType) {
        ElMessage.error($t("未知的文件格式，无法解析"));
        return false;
    }
    if (fileType.value !== "application/json" && fileType.value !== "yaml" && fileType.value !== "application/x-yaml") {
        ElMessage.error($t("仅支持JSON格式或者YAML格式文件"));
        return false;
    }
    if (file.size > config.renderConfig.import.size) {
        ElMessage.error(`${$t("文件大小不超过")}${config.renderConfig.import.size / 1024 / 1024}M`);
        return false;
    }
    return true;
}
//获取导入文件信息
const getImportFileInfo = () => {
    const openApiTranslatorInstance = new OpenApiTranslator(projectId, jsonText.value as OpenAPIV3.Document);
    if ((jsonText.value as MoyuInfo).type === "moyu") {
        importTypeInfo.value.name = "moyu";
        formInfo.value.type = "moyu";
        formInfo.value.moyuData.docs = (jsonText.value as MoyuInfo).docs;
        formInfo.value.moyuData.hosts = (jsonText.value as MoyuInfo).hosts;
    } else if ((jsonText.value as OpenAPIV3.Document).openapi) {
        importTypeInfo.value.name = "openapi";
        importTypeInfo.value.version = (jsonText.value as OpenAPIV3.Document).openapi;
        formInfo.value.type = "openapi";
        formInfo.value.moyuData.docs = openApiTranslatorInstance.getDocsInfo(openapiFolderNamedType.value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((jsonText.value as any).swagger) {
        importTypeInfo.value.name = "swagger";
        importTypeInfo.value.version = (jsonText.value as OpenAPIV3.Document).openapi;
        formInfo.value.type = "swagger";
        formInfo.value.moyuData.docs = openApiTranslatorInstance.getDocsInfo(openapiFolderNamedType.value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((jsonText.value as any)?.info?._postman_id) {
        const postmanTranslatorInstance = new PostmanTranslator(projectId, jsonText.value);
        const docsInfo = postmanTranslatorInstance.getDocsInfo();
        importTypeInfo.value.name = "postman";
        formInfo.value.type = "postman";
        formInfo.value.moyuData.docs = (docsInfo as MoyuInfo).docs;
        formInfo.value.moyuData.hosts = (docsInfo as MoyuInfo).hosts;
        // console.log("docs", docs)
    }
    // postmanTranslatorInstance = new PostmanTranslator($route.query.id);
    // yapiTranslatorInstance = new YAPITranslator($route.query.id);
    // const isArray = Array.isArray(jsonText);
    // const firstEl = isArray ? jsonText[0] : null;
    // const isYapi = firstEl && firstEl.add_time && firstEl.up_time;
    // if (jsonText.type === "moyu") {
    //     importTypeInfo.name = "moyu";
    //     formInfo.type = "moyu";
    //     formInfo.moyuData = jsonText;
    // } else if (jsonText.info?._postman_id) {
    //     importTypeInfo.name = "postman";
    //     importTypeInfo.version = "postman";
    //     formInfo.type = "postman";
    //     formInfo.moyuData = postmanTranslatorInstance.convertPostmanData(jsonText);
    // } else if (jsonText.openapi) {
    //     importTypeInfo.name = "openapi";
    //     importTypeInfo.version = jsonText.openapi;
    //     formInfo.type = "openapi";
    //     formInfo.moyuData = openApiTranslatorInstance.convertToMoyuDocs(jsonText, { folderNamedType: openapiFolderNamedType });
    // } else if (jsonText.swagger) {
    //     importTypeInfo.name = "swagger";
    //     importTypeInfo.version = jsonText.swagger;
    //     formInfo.type = "swagger";
    //     formInfo.moyuData = openApiTranslatorInstance.convertToMoyuDocs(jsonText, { folderNamedType: openapiFolderNamedType });
    // } else if (isYapi) {
    //     importTypeInfo.name = "yapi";
    //     formInfo.type = "yapi";
    //     formInfo.moyuData = yapiTranslatorInstance.convertYapiData(jsonText);
    // } else {
    //     importTypeInfo.name = "未知类型";
    // }
    // projectName = formInfo.moyuData?.info?.projectName;
}
//上传成功读取文件内容
const requestHook = (e: { file: File }) => {
    e.file.text().then((fileStr) => {
        if (fileType.value === "yaml" || fileType.value === "application/x-yaml") {
            jsonText.value = jsyaml.load(fileStr) as OpenAPIV3.Document;
        } else {
            jsonText.value = JSON.parse(fileStr)
        }
        getImportFileInfo();
    }).catch((err) => {
        console.error(err);
    });
}
//导入数据预览
const previewNavTreeData = computed(() => {
    const docs = formInfo.value.moyuData.docs || [];
    const result = [];
    for (let i = 0; i < docs.length; i += 1) {
        const docInfo = docs[i];
        if (!docInfo.pid) { //根元素
            docInfo.children = [];
            result.push(docInfo);
        }
        const id = docInfo._id.toString();
        for (let j = 0; j < docs.length; j += 1) {
            if (id === docs[j].pid) { //项目中新增的数据使用标准id
                if (docInfo.children == null) {
                    docInfo.children = [];
                }
                docInfo.children.push(docs[j]);
            }
        }
    }
    return result;
})
/*
|--------------------------------------------------------------------------
| 额外配置信息
|--------------------------------------------------------------------------
|
*/
//改变导入方式，如果为覆盖类型提醒用户
const handleChangeIsCover = (val: boolean) => {
    if (val) {
        ElMessageBox.confirm($t("覆盖后的数据将无法还原"), $t("提示"), {
            confirmButtonText: $t("确定"),
            cancelButtonText: $t("取消"),
            type: "warning",
        }).catch((err) => {
            if (err === "cancel" || err === "close") {
                formInfo.value.cover = false;
                return;
            }
            console.error(err)
        });
    }
}
//节点选中状态改变时候
const handleCheckChange = (data: ApidocDetail, { checkedKeys } : { checkedKeys: ApidocDetail[] }) => {
    docTree2.value?.setCheckedKeys([]);
    if (checkedKeys.length > 0) {
        docTree2.value?.setCheckedKeys([data._id]);
    }
    currentMountedNode.value = data;
}
//改变命名方式
const handleChangeNamedType = () => {
    const openApiTranslatorInstance = new OpenApiTranslator(projectId, jsonText.value as OpenAPIV3.Document);
    formInfo.value.moyuData.docs = openApiTranslatorInstance.getDocsInfo(openapiFolderNamedType.value);
}
//是否导入到特定文件夹
const handleToggleTargetFolder = (val: boolean) => {
    currentMountedNode.value = null;
    if (val) {
        loading2.value = true;
        const params = {
            projectId,
        };
        axios.get("/api/project/doc_tree_folder_node", { params }).then((res) => {
            navTreeData.value = res.data;
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            loading2.value = false;
        });
    }
}
/*
|--------------------------------------------------------------------------
| 确定导入
|--------------------------------------------------------------------------
|
*/
const handleSubmit = () => {
    try {
        loading.value = true;
        if (!formInfo.value.moyuData.docs) {
            ElMessage.warning($t("请选择需要导入的文件"));
            return;
        }
        const mountedId = currentMountedNode.value?._id;
        const docs = formInfo.value.moyuData.docs.map((val) => ({
            ...val,
            pid: val.pid || mountedId,
        }))
        const params = {
            projectId,
            cover: formInfo.value.cover,
            moyuData: {
                ...formInfo.value.moyuData,
                docs,
            },
        };
        console.log(params)
        axios.post("/api/project/import/moyu", params).then(() => {
            store.dispatch("apidoc/banner/getDocBanner", { projectId })
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            loading.value = false;
        });
    } catch (error) {
        ElMessage.warning((error as Error).message);
        loading.value = false;
    }
}
</script>

<style lang="scss">
.doc-import {
    overflow-y: auto;
    height: calc(100vh - #{size(120)});
    width: 70%;
    min-width: size(768);
    margin: 0 auto;
    .el-upload {
        width: 100%;
    }
    .el-upload-dragger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        height: size(30);
        &:hover {
            .more {
                display: block;
            }
        }
        &>img {
            width: size(16);
            height: size(16);
        }
        .file-icon {
            font-size: fz(14);
            margin-right: size(5);
        }
        .folder-icon {
            color: $yellow;
            flex: 0 0 auto;
            width: size(16);
            height: size(16);
            margin-right: size(5);
        }
        .node-label-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
            .node-top {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .node-bottom {
                color: $gray-500;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    .el-tree-node__content {
        height: size(30);
        display: flex;
        align-items: center;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
}
</style>
