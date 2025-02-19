/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:58
    模块名称：文档编辑页面
    备注：
*/
<template>
    <div class="doc-view">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-nav></s-nav>
            <s-content></s-content>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount } from "vue"
import { router } from "@/router/index"
import { useStore } from "@/store/index"
import sBanner from "./banner/banner.vue";
import sNav from "./nav/nav.vue";
import sContent from "./content/content.vue";

const store = useStore();
const projectId = router.currentRoute.value.query.id as string;
//当前选中的tab
const currentSelectTab = computed(() => {
    const tabs = store.state["apidoc/tabs"].tabs[projectId];
    const selectedTab = tabs?.find((tab) => tab.selected) || null;
    return selectedTab;
})
//是否正在保存数据
const saveDocLoading = computed(() => store.state["apidoc/apidoc"].loading)
//当前工作区状态
const isView = computed(() => store.state["apidoc/baseInfo"].mode === "view")
//=====================================绑定快捷键====================================//
const bindShortcut = (e: KeyboardEvent) => {
    if (isView.value) {
        return;
    }
    const tabs = store.state["apidoc/tabs"].tabs[projectId];
    const hasTabs = tabs && tabs.length > 0;
    const currentTabIsDoc = currentSelectTab.value?.tabType === "doc";
    if (hasTabs && currentTabIsDoc && e.ctrlKey && e.key === "s" && saveDocLoading.value === false) {
        e.preventDefault();
        e.stopPropagation();
        store.dispatch("apidoc/apidoc/saveApidoc");
    }
}
//=====================================基本数据获取====================================//
//获取项目基本信息
const getProjectInfo = () => {
    store.dispatch("apidoc/baseInfo/getProjectBaseInfo", { projectId });
}
//初始化cookie
const initCookies = () => {
    store.commit("apidoc/baseInfo/initCookies")
}
//初始化布局
const initLayout = () => {
    store.commit("apidoc/baseInfo/initLayout")
}
//初始化header信息
const initCommonHeaders = () => {
    store.dispatch("apidoc/baseInfo/getCommonHeaders")
}
onMounted(() => {
    window.addEventListener("keydown", bindShortcut);
    getProjectInfo();
    initCookies();
    initLayout();
    initCommonHeaders();
})
onBeforeUnmount(() => {
    window.removeEventListener("keydown", bindShortcut);
})
//初始化预览模式或者编辑模式
const routerMode = router.currentRoute.value.query.mode as string;
let mode = "view";
if (routerMode === "view") {
    mode = "view"
} else if (routerMode === "edit") {
    mode = "edit"
}
store.commit("apidoc/baseInfo/changeMode", mode);
</script>

<style lang="scss">
.doc-view {
    display: flex;
    overflow: hidden;
    height: 100%;
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
