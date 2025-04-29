<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import { type GitLab, gitlabStore } from '@/stores/gitlab'

import { type SetCustomAttributeParams, setGitLabCustomAttribute } from '@/api/gitlab/user'

const configRef = ref<FormInstance>()
const config = reactive<GitLab>({
  domain: '',
  token: '',
})
const configRules = reactive<FormRules<GitLab>>({
  domain: [{ required: true, message: '域名 必填', trigger: 'blur' }],
  token: [{ required: true, message: 'Token 必填', trigger: 'blur' }],
})

const customRef = ref<FormInstance>()
const custom = reactive<SetCustomAttributeParams>({
  userId: '',
  attributeKey: '',
  value: '',
})
const customRules = reactive<FormRules<SetCustomAttributeParams>>({
  userId: [{ required: true, message: '用户ID 必填', trigger: 'blur' }],
  attributeKey: [{ required: true, message: '属性键 必填', trigger: 'blur' }],
  value: [{ required: true, message: '属性值 必填', trigger: 'blur' }],
})

const options = gitlabStore.getConfigs

const selectDomain = (domain: string) => {
  const gitlab = gitlabStore.getConfig(domain)
  if (gitlab) {
    config.token = gitlab.token
  }
}

const initData = function () {
  config.domain = gitlabStore.defaultDomain
  selectDomain(config.domain)
}

initData()

const save = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      gitlabStore.setConfig(config)
      gitlabStore.setDefaultDomain(config.domain)
    } else {
      console.log('error submit!', fields)
    }
  })
}

watch(
  () => config.domain,
  (newValue) => {
    selectDomain(newValue)
  },
)

// watch(
//   () => form,
//   (newValue) => {
//     gitlabStore.setConfig(newValue)
//   },
//   { deep: true },
// )

const setCustomAttribute = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      setGitLabCustomAttribute(config, custom)
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<template>
  <div>
    <h1>GitLab User</h1>
    <el-form ref="configRef" :model="config" :rules="configRules" label-width="auto" style="">
      <el-form-item label="GitLab domain" prop="domain">
        <el-select
          v-model="config.domain"
          clearable
          filterable
          allow-create
          default-first-option
          :reserve-keyword="true"
          style=""
        >
          <el-option
            v-for="item in options"
            :key="item.domain"
            :label="item.domain"
            :value="item.domain"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="GitLab token" prop="token">
        <el-input v-model="config.token" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save(configRef)">Save</el-button>
      </el-form-item>
    </el-form>

    <el-form ref="customRef" :model="custom" :rules="customRules" label-width="auto" style="">
      <el-form-item label="GitLab userId" prop="userId">
        <el-input v-model="custom.userId" />
      </el-form-item>
      <el-form-item label="GitLab attributeKey" prop="attributeKey">
        <el-input v-model="custom.attributeKey" />
      </el-form-item>
      <el-form-item label="GitLab value" prop="value">
        <el-input v-model="custom.value" />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="setCustomAttribute(customRef)"
      >Set Custom Attribute
    </el-button>
  </div>
</template>

<style scoped></style>
