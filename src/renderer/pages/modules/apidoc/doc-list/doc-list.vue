/*
    创建者：shuxiaokai
    创建时间：2021-07-13 21:24
    模块名称：文档列表
    备注：
*/
<template>
    <div class="doc-list">
        <el-tabs v-model="activeName">
            <el-tab-pane name="tab-a">
                <template #label>
                    <span class="d-flex a-center">
                        <el-icon :size="16" class="mr-1">
                            <Tickets />
                        </el-icon>
                        <span>{{ $t("项目列表") }}</span>
                    </span>
                </template>
            </el-tab-pane>
            <!-- <el-tab-pane name="tab-b">
                <template #label>
                    <span>
                        <el-icon :size="16" class="mr-1">
                            <Tickets />
                        </el-icon>
                        <span>团队管理</span>
                    </span>
                </template>
            </el-tab-pane> -->
        </el-tabs>
        <component :is="activeName === 'tab-a' ? tabA : tabA"></component>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { Tickets } from "@element-plus/icons-vue"
import tabA from "./tab-a/tab-a.vue"

const activeName = ref("tab-a"); //当前激活选项卡

</script>

<style lang="scss">
.doc-list {
    width: 70%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    @media only screen and (max-width: 720px) {
        width: 100%;
        padding: 0 20px;
    }
}
</style>
