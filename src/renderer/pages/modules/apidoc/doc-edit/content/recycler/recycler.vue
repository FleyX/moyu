/*
    创建者：shuxiaokai
    创建时间：2021-10-26 22:21
    模块名称：回收站
    备注：
*/
<template>
    <div class="recycler">
        <!-- 过滤条件 -->
        <s-fieldset title="过滤条件" class="search">
            <!-- 操作人员 -->
            <div class="op-item">
                <div>操作人员：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox v-for="(item, index) in memberEnum" :key="index" :label="item.name"></el-checkbox>
                    <el-button link type="primary" text @click="handleClearOperator">清空</el-button>
                </el-checkbox-group>
            </div>
            <!-- 日期范围 -->
            <div class="op-item">
                <div class="flex0">
                    <span>日期范围&nbsp;</span>
                    <span>：</span>
                </div>
                <el-radio-group v-model="dateRange">
                    <el-radio label="1d">今天</el-radio>
                    <el-radio label="yesterday">昨天</el-radio>
                    <el-radio label="2d">近两天</el-radio>
                    <el-radio label="3d">近三天</el-radio>
                    <el-radio label="7d">近七天</el-radio>
                    <el-radio label="自定义">自定义</el-radio>
                    <el-date-picker
                        v-if="dateRange === '自定义'"
                        v-model="customDateRange"
                        type="datetimerange"
                        range-separator="至"
                        value-format="x"
                        start-placeholder="开始日期"
                        class="mr-1"
                        end-placeholder="结束日期"
                    >
                    </el-date-picker>
                    <el-button link type="primary" text @click="handleClearDate">清空</el-button>
                </el-radio-group>
            </div>
            <!-- 接口名称和接口url -->
            <div class="op-item">
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口名称：</div>
                    <el-input v-model="formInfo.docName" :size="config.renderConfig.layout.size" placeholder="通过接口名称匹配" maxlength="100" clearable></el-input>
                </div>
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口url：</div>
                    <el-input v-model="formInfo.url" :size="config.renderConfig.layout.size" placeholder="通过接口url匹配" maxlength="100" clearable></el-input>
                </div>
                <div>
                    <el-button type="info" @click="clearAll">全部清空</el-button>
                    <el-button :loading="loading" type="success" @click="getData">刷新</el-button>
                </div>
            </div>
        </s-fieldset>
        <!-- 列表展示 -->
        <s-loading v-if="deletedList.length > 0" :loading="loading" class="list">
            <div v-for="(item, index) in deletedInfo" :key="index" class="list-wrap">
                <h2 class="title">{{ item.title }}</h2>
                <div class="oneday-wrap">
                    <div v-for="(chunkDeleteInfo, key) in item.deleted" :key="key" class="date-chunk">
                        <h3 class="date my-2">{{ $helper.formatDate(key, "a HH:mm") }}</h3>
                        <div class="date-list-wrap">
                            <div v-for="(docInfo, index3) in chunkDeleteInfo" :key="index3" class="docinfo">
                                <div class="op-area mr-4">
                                    <el-button link type="primary" text :loading="loading2" @click="handleRestore(docInfo)">恢复</el-button>
                                    <el-divider direction="vertical"></el-divider>
                                    <el-popover v-model:visible="docInfo._visible" placement="right" width="auto" trigger="manual" transition="none">
                                        <doc-detail v-if="docInfo._visible" :id="docInfo._id" @close="docInfo._visible = false;"></doc-detail>
                                        <template #reference>
                                            <el-button link type="primary" text @click.stop="handleShowDetail(docInfo)">详情</el-button>
                                        </template>
                                    </el-popover>
                                </div>
                                <div class="operator mr-1">{{ docInfo.deletePerson }}</div>
                                <div class="mr-2">删除了</div>
                                <div v-if="docInfo.isFolder" class="d-flex a-center">
                                    <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16" height="16" class="mr-1" />
                                    <span>{{ docInfo.name }}</span>
                                </div>
                                <div v-else class="d-flex a-center">
                                    <img :src="require('@/assets/imgs/apidoc/file.png')" width="16" height="16" class="mr-1" />
                                    <span class="mr-2">{{ docInfo.name }}</span>
                                    <template v-for="(req) in validRequestMethods">
                                        <span v-if="docInfo.method === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                                    </template>
                                    <span>{{ docInfo.path }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </s-loading>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, watch, computed } from "vue"
import dayjs from "dayjs"
import isToday from "dayjs/plugin/isToday"
import isYesterday from "dayjs/plugin/isYesterday"
import "dayjs/locale/zh-cn"
import { ElMessageBox } from "element-plus"
import type { ApidocHttpRequestMethod, ApidocType, ResponseTable, ApidocProjectPermission } from "@@/global"
import { router } from "@/router/index"
import { axios } from "@/api/api"
import { store } from "@/store/index"
import { forEachForest, debounce } from "@/helper"
import docDetail from "./components/doc-detail.vue"

dayjs.extend(isYesterday)
dayjs.extend(isToday)
dayjs.locale("zh-cn")

type DeleteInfo = {
    _id: string, //项目id
    deletePerson: string, //删除人
    host: string, //host信息
    isFolder: boolean, //是否为文件夹
    method: ApidocHttpRequestMethod, //请求方法
    name: string, //文件名称
    path: string, //请求路径
    pid: string, //父元素id
    type: ApidocType, //文档类型
    updatedAt: string, //更新时间
    _visible?: boolean,
};
type SearchInfo = {
    projectId: string, //项目id
    startTime: number | null, //--起始日期
    endTime: number | null, //----结束日期
    docName: string, //---------请求名称
    url: string, //----------请求url
    operators: string[], //----操作者信息
}

const projectId = router.currentRoute.value.query.id as string; //项目id
const formInfo: Ref<SearchInfo> = ref({
    projectId, //项目id
    startTime: null, //--起始日期
    endTime: null, //----结束日期
    docName: "", //---------请求名称
    url: "", //----------请求url
    operators: [], //----操作者信息
})

/*
|--------------------------------------------------------------------------
| 获取已删除数据信息
|--------------------------------------------------------------------------
*/
const loading = ref(false); //获取数据加载状态
const deletedList: Ref<DeleteInfo[]> = ref([]); //已删除数据列表
const getData = () => {
    loading.value = true;
    const params = formInfo.value;
    axios.post<ResponseTable<DeleteInfo[]>, ResponseTable<DeleteInfo[]>>("/api/docs/docs_deleted_list", params).then((res) => {
        deletedList.value = res.data.rows;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}

/*
|--------------------------------------------------------------------------
| 搜索相关内容
|--------------------------------------------------------------------------
*/
const memberEnum: Ref<{ name: string, permission:ApidocProjectPermission }[]> = ref([]); //操作人员
const dateRange: Ref<string> = ref(""); //日期范围
const customDateRange: Ref<number[]> = ref([]); //自定义日期范围
//获取操作人员枚举
const getOperatorEnum = () => {
    const params = {
        projectId,
    };
    axios.get("/api/docs/docs_history_operator_enum", { params }).then((res) => {
        memberEnum.value = res.data as { name: string, permission:ApidocProjectPermission }[];
    }).catch((err) => {
        console.error(err);
    });
}
//清空操作人员
const handleClearOperator = () => {
    formInfo.value.operators = [];
}
//清空日期范围
const handleClearDate = () => {
    dateRange.value = ""; //startTime和endTime会在watch中发送改变
}
//全部清空
const clearAll = () => {
    handleClearOperator();
    handleClearDate();
    formInfo.value.url = "";
    formInfo.value.docName = "";
}
//自定义日期范围
watch(() => dateRange.value, (val) => {
    let startTime: number | null = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
    let endTime: number | null = null;
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
watch(() => customDateRange.value, (val) => {
    if (!val || val.length === 0) {
        formInfo.value.startTime = null;
        formInfo.value.endTime = null;
    } else {
        formInfo.value.startTime = val[0];
        formInfo.value.endTime = val[1];
    }
})

const debounceFn: Ref<(() => void) | null> = ref(null);
watch(() => formInfo.value, () => {
    if (!debounceFn.value) {
        debounceFn.value = debounce(() => {
            getData();
        });
    }
    if (debounceFn.value) {
        debounceFn.value();
    }
}, {
    deep: true
})
onMounted(() => {
    getData();
    getOperatorEnum();
})
/*
|--------------------------------------------------------------------------
| 列表数据
|--------------------------------------------------------------------------
*/
//被删除数据
const deletedInfo = computed(() => {
    const result: Record<string, {
        title: string,
        deleted: Record<string, DeleteInfo[]>
    }> = {};
    deletedList.value.forEach((item) => {
        const { updatedAt } = item;
        const ymdString = dayjs(updatedAt).format("YYYY-MM-DD");
        const ymdhmString = dayjs(updatedAt).format("YYYY-MM-DD HH:mm");
        if (!result[ymdString]) {
            let title = "";
            if (dayjs(updatedAt).isToday()) {
                title = "今天"
            } else if (dayjs(updatedAt).isYesterday()) {
                title = "昨天"
            } else {
                title = dayjs(updatedAt).format("YYYY年M月DD号");
            }
            result[ymdString] = {
                title,
                deleted: {},
            };
        }
        if (!result[ymdString].deleted[ymdhmString]) {
            result[ymdString].deleted[ymdhmString] = [];
        }
        result[ymdString].deleted[ymdhmString].push(item);
    })
    return result;
})
//请求方法
const validRequestMethods = computed(() => store.state["apidoc/baseInfo"].rules.requestMethods)

/*
|--------------------------------------------------------------------------
| 列表数据相关操作
|--------------------------------------------------------------------------
*/
const loading2 = ref(false); //回复按钮
//恢复接口
const restoreDocDirectly = (docInfo: DeleteInfo) => {
    ElMessageBox.confirm(`确实要恢复 ${docInfo.name} 吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        loading2.value = true;
        const params = {
            _id: docInfo._id,
            projectId,
        };
        axios.put("/api/docs/docs_restore", params).then((res) => {
            const delIds = res.data;
            for (let i = 0; i < delIds.length; i += 1) {
                const id = delIds[i];
                console.log(id)
                const delIndex = deletedList.value.findIndex((val) => val._id === id);
                deletedList.value.splice(delIndex, 1)
            }
            store.dispatch("apidoc/banner/getDocBanner", {
                projectId,
            })
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            loading2.value = false;
        });
    }).catch((err) => {
        if (err === "cancel" || err === "close") {
            return;
        }
        console.error(err);
    });
}
//恢复接口
const handleRestore = (docInfo: DeleteInfo) => {
    const { banner } = store.state["apidoc/banner"];
    const { pid, isFolder } = docInfo;
    let hasParent = false;
    forEachForest(banner, (node) => {
        if (node._id === pid) {
            hasParent = true;
        }
    });
    if (!pid && !isFolder) { //文档，根元素
        restoreDocDirectly(docInfo)
    } else if (pid && !isFolder && hasParent) { //文档，非根元素,存在父元素
        restoreDocDirectly(docInfo)
    } else if (pid && !isFolder && !hasParent) { //文档，非根元素,不存在父元素
        restoreDocDirectly(docInfo)
    } else {
        restoreDocDirectly(docInfo)
    }
}
//查看详情
const handleShowDetail = (docInfo: DeleteInfo) => {
    Object.keys(deletedInfo.value).forEach((key) => {
        const el = deletedInfo.value[key];
        Object.keys(el.deleted).forEach((key2) => {
            const el2 = el.deleted[key2];
            el2.forEach((info) => {
                info._visible = false;
            })
        })
    })
    docInfo._visible = true;
};
onMounted(() => {
    document.documentElement.addEventListener("click", () => {
        Object.keys(deletedInfo.value).forEach((key) => {
            const el = deletedInfo.value[key];
            Object.keys(el.deleted).forEach((key2) => {
                const el2 = el.deleted[key2];
                el2.forEach((info) => {
                    info._visible = false;
                })
            })
        })
    })
})
</script>

<style lang="scss">
.recycler {
    padding: 0 size(20) size(10);
    height: calc(100vh - #{size(100)});
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    // 搜索
    .search {
        flex: 0 0 auto;
        .el-checkbox, .el-radio {
            margin-right: size(15);
        }
        .op-item {
            min-height: size(50);
            display: flex;
            align-items: center;
            &:not(:last-of-type) {
                border-bottom: 1px dashed $gray-300;
            }
            .el-button--text {
                padding-top: size(5);
                padding-bottom: size(5);
            }
        }
    }
    // 列表展示
    .list {
        flex: 1;
        overflow-y: auto;
        .item {
            display: flex;
            align-items: center;
            height: size(40);
            overflow: hidden;
            .head {
                flex: 0 0 auto;
                width: size(80);
            }
        }
        .date-chunk {
            margin-left: size(30);
            display: flex;
            flex-direction: column;
            .date-list-wrap {
                margin-left: size(30);
                .docinfo {
                    display: flex;
                    align-items: center;
                    height: size(30);
                    &:hover {
                        background: $gray-200;
                    }
                }
                .op-area {
                    width: size(100);
                }
            }
        }
    }
}
</style>
