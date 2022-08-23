<template>
    <el-form ref="form" :model="form" :rules="rules" @submit.stop.prevent="submit">
        <el-form-item prop="remoteUrl">
            <el-input v-model="form.remoteUrl" :size="config.renderConfig.layout.size" name="remoteUrl"
                      type="text" :placeholder="`${$t('请输入服务器地址')}...`"
            ></el-input>
        </el-form-item>
        <el-form-item>
            <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ $t("提交") }}</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { changeBaseUrl } from "@/api/api";

export default defineComponent({
    data() {
        return {
            form: {
                remoteUrl: ""
            },
            rules: {
                remoteUrl: [{ required: true, message: this.$t("请输入服务器地址") }],
            },
            loading: false,
        };
    },
    methods: {
        submit() {
            changeBaseUrl(this.form.remoteUrl);
            this.$message.success("保存成功");
        }
    },
})
</script>

<style lang="scss">

</style>
