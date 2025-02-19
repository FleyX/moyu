/*
    创建者：shuxiaokai
    创建时间：2021-08-15 16:34
    模块名称：接口文档录入
    备注：
*/
<template>
    <div v-loading="loading" class="apidoc" :class="{ vertical: layout === 'vertical' }">
        <div class="request-layout" :class="{ vertical: layout === 'vertical' }">
            <s-operation></s-operation>
            <s-params></s-params>
        </div>
        <el-divider v-show="layout === 'vertical' && !isVerticalDrag" content-position="left">Response</el-divider>
        <s-resize-y
            v-if="layout === 'vertical'"
            :min="150"
            :max="550"
            :height="350"
            name="response-y"
            tabindex="1"
            @dragStart="isVerticalDrag = true"
            @dragEnd="isVerticalDrag = false"
        >
            <s-response></s-response>
        </s-resize-y>
        <s-resize-x v-if="layout === 'horizontal'" :min="500" :max="750" :width="500" name="response" bar-left class="response-layout" tabindex="1">
            <s-response></s-response>
        </s-resize-x>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { ApidocTab } from "@@/store"
import { apidocCache } from "@/cache/apidoc"
import operation from "./operation/operation.vue"
import params from "./params/params.vue"
import response from "./response/response.vue"

export default defineComponent({
    components: {
        "s-operation": operation,
        "s-params": params,
        "s-response": response,
    },
    data() {
        return {
            isVerticalDrag: false
        };
    },
    computed: {
        currentSelectTab(): ApidocTab | null { //当前选中的doc
            const projectId = this.$route.query.id as string;
            const tabs = this.$store.state["apidoc/tabs"].tabs[projectId];
            const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
            return currentSelectTab;
        },
        loading() {
            return this.$store.state["apidoc/apidoc"].loading;
        },
        layout() {
            return this.$store.state["apidoc/baseInfo"].layout;
        },
    },
    watch: {
        currentSelectTab: {
            handler(val: ApidocTab | null, oldVal: ApidocTab | null) {
                const isApidoc = val?.tabType === "doc";
                if (isApidoc && val?._id !== oldVal?._id) {
                    this.getApidocInfo();
                }
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        //获取api文档数据
        getApidocInfo() {
            if (!this.currentSelectTab) {
                return
            }
            if (this.currentSelectTab.saved) { //取最新值
                this.$store.dispatch("apidoc/apidoc/getApidocDetail", {
                    id: this.currentSelectTab?._id,
                    projectId: this.$route.query.id,
                })
            } else { //取缓存值
                const catchedApidoc = apidocCache.getApidoc(this.currentSelectTab._id);
                if (!catchedApidoc) {
                    this.$store.dispatch("apidoc/apidoc/getApidocDetail", {
                        id: this.currentSelectTab?._id,
                        projectId: this.$route.query.id,
                    })
                } else {
                    this.$store.commit("apidoc/apidoc/changeApidoc", catchedApidoc);
                }
            }
            //=====================================获取缓存的返回参数====================================//
            const localResponse = apidocCache.getResponse(this.currentSelectTab._id);
            this.$store.commit("apidoc/response/clearResponseInfo")
            if (localResponse) {
                this.$store.commit("apidoc/response/changeAll", localResponse);
            }
        },
    },
})
</script>

<style lang="scss" scoped>
.apidoc {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    display: flex;
    &.vertical {
        flex-direction: column;
        overflow: hidden;
    }
    // 请求编辑区域
    .request-layout {
        flex: 1;
        overflow: hidden;
        border-right: 1px solid $gray-400;
        &.vertical {
            flex: 1;
            // border-bottom: 1px solid $gray-500;
            overflow-y: auto;
            // margin-top: -2px;
            // box-shadow: 0 3px 1px $gray-400;
        }
    }
    // 返回编辑区域
    .response-layout {
        flex-grow: 0;
        flex-shrink: 0;
        width: size(300);
        // flex: 0 0 size(500);
    }
    .el-divider--horizontal {
       margin: 0;
       z-index: $zIndex-drag-bar;
       font-size: fz(14);
    }
}
</style>
