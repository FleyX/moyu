/*
    创建者：shuxiaokai
    创建时间：2021-07-27 21:24
    模块名称：banner菜单顶部搜索和操作区域
    备注：
*/
<template>
    <div class="tool">
        <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
        <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
        <div class="p-relative">
            <el-input v-model="formInfo.iptValue" size="large" class="doc-search" :placeholder="$t('文档名称、文档url')" clearable @change="handleFilterBanner"></el-input>
            <el-badge :is-dot="hasFilterCondition" class="badge">
                <el-popover placement="right-end" transition="none" width="50vw" trigger="click">
                    <template #reference>
                        <div class="advance" :title="$t('高级筛选')">
                            <i class="iconfont icongaojishaixuan"></i>
                        </div>
                    </template>
                    <s-fieldset title="过滤条件" class="search-panel">
                        <!-- 操作人员 -->
                        <div class="op-item a-center">
                            <div class="flex0">{{ $t("操作人员") }}：</div>
                            <el-checkbox-group v-model="formInfo.maintainers">
                                <el-checkbox v-for="(item, index) in maintainerEnum" :key="index" :label="item"></el-checkbox>
                                <el-button link type="primary" text class="ml-2" @click="handleClearMaintainer">{{ $t("清空") }}</el-button>
                            </el-checkbox-group>
                        </div>
                        <!-- 日期范围 -->
                        <div class="op-item">
                            <div class="flex0">
                                <span>{{ $t("录入日期") }}&nbsp;</span>
                                <span>：</span>
                            </div>
                            <el-radio-group v-model="dateRange">
                                <el-radio label="1d">{{ $t("今天") }}</el-radio>
                                <el-radio label="2d">{{ $t("近两天") }}</el-radio>
                                <el-radio label="3d">{{ $t("近三天") }}</el-radio>
                                <el-radio label="7d">{{ $t("近七天") }}</el-radio>
                                <el-radio label="自定义">{{ $t("自定义") }}</el-radio>
                                <el-date-picker
                                    v-if="dateRange === '自定义'"
                                    v-model="customDateRange"
                                    type="datetimerange"
                                    :range-separator="$t('至')"
                                    value-format="x"
                                    :start-placeholder="$t('开始日期')"
                                    class="mr-1"
                                    :end-placeholder="$t('结束日期')"
                                >
                                </el-date-picker>
                                <el-button link type="primary" text @click="handleClearDate">{{ $t("清空") }}</el-button>
                            </el-radio-group>
                        </div>
                        <!-- 最近多少条数据 -->
                        <div class="op-item">
                            <div class="flex0">
                                <span>{{ $t("最近多少条") }}&nbsp;</span>
                                <span>：</span>
                            </div>
                            <el-radio-group v-model="formInfo.recentNum">
                                <el-radio :label="2">{{ $t("2条") }}</el-radio>
                                <el-radio :label="5">{{ $t("5条") }}</el-radio>
                                <el-radio :label="10">{{ $t("10条") }}</el-radio>
                                <el-radio :label="15">{{ $t("15条") }}</el-radio>
                                <el-button link type="primary" text @click="handleClearRecentNum">{{ $t("清空") }}</el-button>
                            </el-radio-group>
                        </div>
                    </s-fieldset>
                </el-popover>
            </el-badge>
        </div>
        <!-- 工具栏 -->
        <div class="tool-icon mt-1">
            <!-- 固定的工具栏操作 -->
            <s-draggable v-model="pinOperations" animation="150" item-key="name" class="operation" group="operation">
                <template #item="{ element }">
                    <div :title="element.name" class="cursor-pointer" :class="{ 'cursor-not-allowed': isView && !element.viewOnly }">
                        <svg class="svg-icon" aria-hidden="true" @click="handleEmit(element.op)">
                            <use :xlink:href="element.icon"></use>
                        </svg>
                    </div>
                </template>
            </s-draggable>
            <!-- 全部工具栏操作 -->
            <el-popover v-model:visible="visible" popper-class="tool-panel" transition="none" placement="right" :width="320" trigger="manual">
                <template #reference>
                    <div class="more" @click.stop="visible = !visible">
                        <el-icon :size="16" :title="$t('更多操作')" class="more-op">
                            <MoreFilled />
                        </el-icon>
                    </div>
                </template>
                <div class="border-bottom-gray-300 py-2 px-2">{{ $t("快捷操作") }}</div>
                <div class="toolbar-close" @click="visible = false">
                    <el-icon :size="18" class="more-op">
                        <Close />
                    </el-icon>
                </div>
                <s-draggable v-model="operations" animation="150" item-key="name" group="operation2">
                    <template #item="{ element }">
                        <div class="dropdown-item cursor-pointer" :class="{ 'cursor-not-allowed': isView && !element.viewOnly }" @click="handleEmit(element.op)">
                            <svg class="svg-icon mr-2" aria-hidden="true">
                                <use :xlink:href="element.icon"></use>
                            </svg>
                            <div class="label">{{ element.name }}</div>
                            <div class="shortcut">
                                <span v-for="(item, index) in element.shortcut" :key="item">
                                    <span>{{ item }}</span>
                                    <span v-if="index !== element.shortcut.length - 1">+</span>
                                </span>
                            </div>
                            <div class="pin iconfont iconpin" :class="{ active: element.pin }" @click.stop="togglePin(element)"></div>
                        </div>
                    </template>
                </s-draggable>
            </el-popover>
        </div>
    </div>
    <s-add-file-dialog v-if="addFileDialogVisible" v-model="addFileDialogVisible" @success="handleAddFileAndFolderCb"></s-add-file-dialog>
    <s-add-folder-dialog v-if="addFolderDialogVisible" v-model="addFolderDialogVisible" @success="handleAddFileAndFolderCb"></s-add-folder-dialog>
</template>

<script lang="ts" setup>
import { ref, Ref, computed, watch, onMounted, onUnmounted } from "vue"
import sDraggable from "vuedraggable"
import { MoreFilled, Close } from "@element-plus/icons-vue"
import type { ApidocBanner, ApidocOperations } from "@@/global"
import { store } from "@/store/index"
import { forEachForest } from "@/helper/index"
import { router } from "@/router/index"
import { $t } from "@/i18n/i18n"
import sAddFileDialog from "../../dialog/add-file/add-file.vue"
import sAddFolderDialog from "../../dialog/add-folder/add-folder.vue"
import localOriginOperations from "./operations"
import { addFileAndFolderCb } from "../composables/curd-node"

type Operation = {
    /**
     * 操作名称
     */
    name: string,
    /**
     * 图标
     */
    icon: string,
    /**
     * 操作标识
     */
    op: string,
    /**
     * 快捷键
     */
    shortcut: string[],
    /**
     * 是否固定操作栏
     */
    pin: boolean,
    /**
     * 预览模式展示
     */
    viewOnly?: boolean,
};

const emit = defineEmits(["fresh", "filter"])
//当前工作区状态
const isView = computed(() => store.state["apidoc/baseInfo"].mode === "view")
//新增文件或者文件夹成功回调
const handleAddFileAndFolderCb = (data: ApidocBanner) => {
    addFileAndFolderCb.call(this, ref(null), data)
};
//=====================================操作栏数据====================================//
const bannerData = computed(() => {
    const originBannerData = store.state["apidoc/banner"].banner;
    return originBannerData
})
const operations: Ref<Operation[]> = ref([]);
const pinOperations: Ref<Operation[]> = ref([]);
const visible = ref(false);
const addFileDialogVisible = ref(false);
const addFolderDialogVisible = ref(false);
const projectName = computed(() => store.state["apidoc/baseInfo"].projectName)
//=====================================操作相关数据====================================//
//初始化缓存数据
const initCacheOperation = () => {
    const localToolbarOperations = localStorage.getItem("apidoc/toolbarOperations");
    const localPinToolbarOperations = localStorage.getItem("apidoc/PinToolbarOperations");
    if (localToolbarOperations) {
        const localData: Operation[] = JSON.parse(localToolbarOperations);
        localOriginOperations.forEach((data) => {
            //如果本地缓存数据没有当前图标则新增图标
            if (localData.every((v: Operation) => (v.name !== data.name && v.op !== data.op))) {
                localData.push(data);
            }
            const matchedData = localData.find((v: Operation) => v.name === data.name);
            if (matchedData?.icon) {
                matchedData.icon = data.icon;
            }
        })
        operations.value = localData;
    } else {
        operations.value = localOriginOperations;
    }
    if (localPinToolbarOperations) {
        const localData: Operation[] = JSON.parse(localPinToolbarOperations);
        localOriginOperations.forEach((data) => {
            const matchedData = localData.find((v: Operation) => v.name === data.name);
            if (matchedData?.icon) {
                matchedData.icon = data.icon;
            }
        })
        pinOperations.value = localData;
    } else {
        pinOperations.value = operations.value.filter((v) => v.pin);
    }
}
//缓存所有操作
watch(operations, (v) => {
    localStorage.setItem("apidoc/toolbarOperations", JSON.stringify(v))
}, {
    deep: true
})
//缓存工具栏操作
watch(pinOperations, (v) => {
    localStorage.setItem("apidoc/PinToolbarOperations", JSON.stringify(v))
}, {
    deep: true
})
//=====================================工具栏操作====================================//
//切换固定操作
const togglePin = (element: Operation) => {
    element.pin = !element.pin;
    pinOperations.value = operations.value.filter((v) => v.pin);
}
//隐藏更多操作
const handleHideMoreOperation = () => {
    visible.value = false;
}
onMounted(() => {
    document.documentElement.addEventListener("click", handleHideMoreOperation);
    initCacheOperation();
});
onUnmounted(() => {
    document.documentElement.removeEventListener("click", handleHideMoreOperation);
})
//点击操作按钮
const projectId = router.currentRoute.value.query.id as string;
const handleEmit = (op: ApidocOperations) => {
    if (isView.value && op !== "freshBanner" && op !== "history") {
        return
    }
    switch (op) {
    case "addRootFolder": //新建文件夹
        addFolderDialogVisible.value = true;
        break;
    case "addRootFile": //新建文件
        addFileDialogVisible.value = true;
        break;
    case "freshBanner": //刷新页面
        emit("fresh");
        break;
    case "generateLink": //在线链接
        store.commit("apidoc/tabs/addTab", {
            _id: "onlineLink",
            projectId,
            tabType: "onlineLink",
            label: $t("在线链接"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "exportDoc": //导出文档
        store.commit("apidoc/tabs/addTab", {
            _id: "exportDoc",
            projectId,
            tabType: "exportDoc",
            label: $t("导出文档"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "importDoc": //导入文档
        store.commit("apidoc/tabs/addTab", {
            _id: "importDoc",
            projectId,
            tabType: "importDoc",
            label: $t("导入文档"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "recycler": //回收站
        store.commit("apidoc/tabs/addTab", {
            _id: "recycler",
            projectId,
            tabType: "recycler",
            label: $t("回收站"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "history": //操作审计
        store.commit("apidoc/tabs/addTab", {
            _id: "history",
            projectId,
            tabType: "history",
            label: $t("操作审计"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "config": //全局设置
        store.commit("apidoc/tabs/addTab", {
            _id: "config",
            projectId,
            tabType: "config",
            label: $t("全局设置"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "hook": //生成代码
        store.commit("apidoc/tabs/addTab", {
            _id: "hook",
            projectId,
            tabType: "hook",
            label: $t("生成代码"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    case "commonHeader": //公共请求头
        store.commit("apidoc/tabs/addTab", {
            _id: "commonHeader",
            projectId,
            tabType: "commonHeader",
            label: $t("公共请求头"),
            head: {
                icon: "",
                color: ""
            },
            saved: true,
            fixed: true,
            selected: true,
        });
        break;
    default:
        break;
    }
    visible.value = false;
}
/*
|--------------------------------------------------------------------------
| 数据过滤
|--------------------------------------------------------------------------
*/
const formInfo = ref({
    iptValue: "", //u
    startTime: null as null | number, //--起始日期
    endTime: null as null | number, //----结束日期
    maintainers: [] as string[], //----操作者信息
    recentNum: 0, //-显示最近多少条
})
//是否存在过滤条件
const hasFilterCondition = computed(() => {
    const hasTimeCondition = formInfo.value.startTime && formInfo.value.endTime;
    const hasOperatorCondition = formInfo.value.maintainers.length > 0;
    const hasRecentNumCondition = formInfo.value.recentNum;
    return !!(hasTimeCondition || hasOperatorCondition || hasRecentNumCondition);
})

//用户列表
const maintainerEnum = computed(() => {
    const { banner } = store.state["apidoc/banner"];
    const allBanner: string[] = [];
    forEachForest(banner, (bannerInfo) => {
        if (bannerInfo.maintainer && !allBanner.includes(bannerInfo.maintainer)) {
            allBanner.push(bannerInfo.maintainer);
        }
    })
    return allBanner;
});
//=====================================日期相关====================================//
//日期范围
const dateRange = ref("");
//自定义日期范围
const customDateRange = ref([]);
//清空日期
const handleClearDate = () => {
    dateRange.value = ""
}
//监听日起段变化
watch(() => dateRange.value, (val) => {
    let startTime: number | null = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
    let endTime = null;
    switch (val) {
    case "1d":
        endTime = Date.now();
        break;
    case "2d":
        endTime = Date.now();
        startTime = endTime - 86400000;
        break;
    case "3d":
        endTime = Date.now();
        startTime = endTime - 3 * 86400000;
        break;
    case "7d":
        endTime = Date.now();
        startTime = endTime - 7 * 86400000;
        break;
    case "yesterday":
        endTime = startTime;
        startTime -= 86400000;
        break;
    default: //自定义
        startTime = null;
        endTime = null;
        customDateRange.value = [];
        break;
    }
    formInfo.value.startTime = startTime;
    formInfo.value.endTime = endTime;
})
//监听日期段变化
watch(() => customDateRange.value, (val) => {
    if (!val || val.length === 0) {
        formInfo.value.startTime = null;
        formInfo.value.endTime = null;
    } else {
        formInfo.value.startTime = val[0];
        formInfo.value.endTime = val[1];
    }
})
//=====================================维护者信息====================================//
//清除所有的维护者数据
const handleClearMaintainer = () => {
    formInfo.value.maintainers = [];
}
//=====================================最近数据条数====================================//
//清除最近新增条数条件
const handleClearRecentNum = () => {
    formInfo.value.recentNum = 0;
}
//=====================================监听数据变化====================================//
watch(() => formInfo.value, (formData) => {
    let plainBannerData: ApidocBanner[] = [];
    const { startTime, endTime, maintainers, recentNum } = formData;
    forEachForest(bannerData.value, (v) => {
        if (!v.isFolder) {
            plainBannerData.push(v);
        }
    })
    if (maintainers.length === 0 && !startTime && !recentNum) {
        emit("filter", {
            iptValue: formData.iptValue,
            recentNumIds: null,
        });
        return
    }

    //录入人员
    if (maintainers.length > 0) {
        plainBannerData = plainBannerData.filter(v => maintainers.find(v2 => v2 === v.maintainer))
    }
    //录入时间
    if (startTime && endTime) {
        plainBannerData = plainBannerData.filter(v => {
            const updateTimestamp = new Date(v.updatedAt).getTime();
            return updateTimestamp > startTime && updateTimestamp < endTime;
        })
    }
    //录入数据个数
    if (recentNum) {
        plainBannerData = plainBannerData.sort((a, b) => {
            const aTime = new Date(a.updatedAt).getTime();
            const bTime = new Date(b.updatedAt).getTime();
            return bTime - aTime;
        }).slice(0, recentNum)
    }
    emit("filter", {
        iptValue: formData.iptValue,
        recentNumIds: plainBannerData.map(v => v._id),
    });
}, {
    deep: true,
    immediate: true,
});

const handleFilterBanner = () => {
    let plainBannerData: ApidocBanner[] = [];
    const { startTime, endTime, maintainers, recentNum } = formInfo.value;
    forEachForest(bannerData.value, (v) => {
        if (!v.isFolder) {
            plainBannerData.push(v);
        }
    })
    if (maintainers.length === 0 && !startTime && !recentNum) {
        emit("filter", {
            iptValue: formInfo.value.iptValue,
            recentNumIds: null,
        });
        return
    }
    //录入人员
    if (maintainers.length > 0) {
        plainBannerData = plainBannerData.filter(v => maintainers.find(v2 => v2 === v.maintainer))
    }
    //录入时间
    if (startTime && endTime) {
        plainBannerData = plainBannerData.filter(v => {
            const updateTimestamp = new Date(v.updatedAt).getTime();
            return updateTimestamp > startTime && updateTimestamp < endTime;
        })
    }
    //录入数据个数
    if (formInfo.value.recentNum) {
        plainBannerData.sort((a, b) => {
            const aTime = new Date(a.updatedAt).getTime();
            const bTime = new Date(b.updatedAt).getTime();
            return aTime - bTime;
        }).slice(0, formInfo.value.recentNum)
    }
    emit("filter", {
        iptValue: formInfo.value.iptValue,
        recentNumIds: plainBannerData.map(v => v._id),
    });
}
</script>

<style lang="scss">
.tool {
    position: relative;
    padding: 0 size(20);
    height: size(150);
    background: $gray-200;
    flex: 0 0 auto;
    .badge {
        width: size(25);
        height: size(25);
        position: absolute;
        top: size(8);
        right: size(25);
        display: flex;
        align-items: center;
        justify-content: center;
        .el-badge__content {
            transition: none;
        }
    }
    //高级筛选按钮
    .advance {
        &>i {
            font-size: fz(14);
            cursor: pointer;
            color: $gray-600;
        }
    }
    // 搜索框样式
    .doc-search {
        .el-input__wrapper {
            border-radius: 20px;
        }
        .el-input__inner {
            border-radius: 20px;
        }
    }
    // 快捷方式样式
    .tool-icon {
        position: relative;
        align-items: center;
        display: flex;
        .item {
            outline: none;
        }
        .operation {
            width: 85%;
            display: flex;
            justify-content: space-between;
        }
        .more {
            display: flex;
            justify-content: center;
            margin-left: auto;
            width: 10%;
            position: relative;
        }
        .svg-icon {
            width: size(25);
            height: size(25);
            padding: size(5);
            &:hover {
                background: $gray-400;
            }
        }
    }
    .more-op {
        width: size(25);
        height: size(25);
        line-height: size(25);
        text-align: center;
        cursor: pointer;
        &:hover {
            background: $gray-400;
        }
    }
}
.dropdown-item {
    height: size(40);
    width: 100%;
    padding: 0 size(10) 0 size(20);
    display: flex;
    align-items: center;
    // cursor: default;
    .label {
        width: size(120);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
    }
    .shortcut {
        width: size(100);
        color: $gray-500;
    }
    .svg-icon {
        width: size(25);
        height: size(25);
        padding: size(5);
    }
    .pin {
        cursor: pointer;
        color: $gray-400;
        &.active {
            color: $theme-color;
            &:hover {
                color: $theme-color;
            }
        }
    }
    &:hover {
        background: $gray-200;
    }
}
.toolbar-close {
    @include rt-close;
}
.el-popover.el-popper.tool-panel {
    padding: 0;
}
.search-panel {
    flex: 0 0 auto;
    .el-checkbox, .el-radio {
        margin-right: size(15);
    }
    .op-item {
        min-height: size(40);
        display: flex;
        align-items: center;
        margin-bottom: size(20);
        &:not(:last-of-type) {
            border-bottom: 1px dashed $gray-300;
        }
        .el-button--text {
            padding-top: size(5);
            padding-bottom: size(5);
        }
        .el-radio-group {
            display: flex;
            align-items: center;
        }
    }
}
</style>
