<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

import { type GitLab, gitlabStore } from '@/stores/gitlab'

import {
  type CustomAttribute,
  deleteCustomAttribute,
  getUser,
  type GetUserParams,
  getUsers,
  setCustomAttribute,
  type User,
} from '@/api/gitlab/user'

const configRef = ref<FormInstance>()
const config = reactive<GitLab>({
  domain: '',
  token: '',
})
const configRules = reactive<FormRules<GitLab>>({
  domain: [{ required: true, message: '域名 必填', trigger: 'blur' }],
  token: [{ required: true, message: 'Token 必填', trigger: 'blur' }],
})

export interface AddCustomAttribute extends CustomAttribute {
  id: number
  input: boolean
}

const addCustomAttributes = ref<AddCustomAttribute[]>([])

const dialogVisible = ref<boolean>(false)
const user = ref<User>()
const handleClose = () => {
  user.value = undefined
  dialogVisible.value = false
  addCustomAttributes.value = []
  search(searchParams)
}

const validatorErrorClass = ref<string>('validator-error')

const valueBlur = (e: FocusEvent) => {
  console.log('valueBlur', e)
  const target = e.target as HTMLElement // 类型断言
  user.value?.custom_attributes.forEach((item) => {
    if (item.key === target.dataset.key) {
      item.valueClassName = item.value === '' ? validatorErrorClass.value : ''
    }
  })
}

const addValueBlur = (e: FocusEvent) => {
  console.log('addValueBlur', e)
  const target = e.target as HTMLElement // 类型断言
  addCustomAttributes.value.forEach((item) => {
    if (item.id + '' === target.dataset.id) {
      item.valueClassName = item.value === '' ? validatorErrorClass.value : ''
    }
  })
}

const addKeyBlur = (e: FocusEvent) => {
  console.log('addKeyBlur', e)
  const target = e.target as HTMLElement // 类型断言
  addCustomAttributes.value.forEach((item) => {
    if (item.id + '' === target.dataset.id) {
      item.keyClassName = item.key === '' ? validatorErrorClass.value : ''
    }
  })
}

const customAttributeClick = (id: number) => {
  dialogVisible.value = true
  user.value = undefined
  getUser(config, id).then((res) => {
    console.log(res.data)
    user.value = res.data
    if (user.value?.custom_attributes.length === 0) {
      addCustomAttributes.value.push({
        id: new Date().getTime(),
        key: '',
        keyClassName: '',
        value: '',
        valueClassName: '',
        input: true,
      })
    }
  })
}
const saveGitLabCustomAttribute = (customAttribute: CustomAttribute | AddCustomAttribute) => {
  const skip = customAttribute.key === '' || customAttribute.value === ''

  if (customAttribute.key === '') {
    if ('id' in customAttribute) {
      addCustomAttributes.value.forEach((item) => {
        if (item.id === customAttribute.id) {
          item.keyClassName = validatorErrorClass.value
        }
      })
    }
  }

  if (customAttribute.value === '') {
    if ('id' in customAttribute) {
      addCustomAttributes.value.forEach((item) => {
        if (item.id === customAttribute.id) {
          item.valueClassName = validatorErrorClass.value
        }
      })
    } else {
      user.value?.custom_attributes.forEach((item) => {
        if (item.key === customAttribute.key) {
          item.valueClassName = validatorErrorClass.value
        }
      })
    }
  }

  if (skip) {
    return
  }

  user.value?.custom_attributes.forEach((item) => {
    if (item.key === customAttribute.key) {
      item.valueClassName = ''
    }
  })

  addCustomAttributes.value.forEach((item) => {
    if (item.key === customAttribute.key) {
      item.valueClassName = ''
    }
  })

  const params = {
    userId: user.value?.id as number,
    attributeKey: customAttribute.key,
    value: customAttribute.value,
  }
  setCustomAttribute(config, params).then((res) => {
    console.log('saveGitLabCustomAttribute', res)
    if ('id' in customAttribute) {
      addCustomAttributes.value.forEach((item) => {
        if (item.id === customAttribute.id) {
          item.input = false
        }
      })
    }
  })
}
const deleteNullCustomAttribute = (id: number) => {
  addCustomAttributes.value = addCustomAttributes.value.filter((item) => item.id !== id)
}

const deleteGitLabCustomAttribute = (key: string) => {
  deleteCustomAttribute(config, user.value?.id as number, key).then((res) => {
    console.log('deleteGitLabCustomAttribute', res)
    if (user.value?.custom_attributes) {
      user.value.custom_attributes = user.value?.custom_attributes.filter(
        (item) => item.key !== key,
      )
      if (user.value?.custom_attributes.length === 0) {
        addCustomAttributes.value.push({
          id: new Date().getTime(),
          key: '',
          keyClassName: '',
          value: '',
          valueClassName: '',
          input: true,
        })
      }
    }
  })
}
const addGitLabCustomAttribute = () => {
  addCustomAttributes.value.push({
    id: new Date().getTime(),
    key: '',
    keyClassName: '',
    value: '',
    valueClassName: '',
    input: true,
  })
  console.log('addCustomAttribute')
}

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

const loading = ref<boolean>(true)
const tableData = reactive<User[]>([])
const searchParams = reactive<GetUserParams>({
  page: 1,
  per_page: 20,
  with_custom_attributes: true,
  sort: 'asc',
})

const total = ref<number>(0)

const search = function (searchParams: GetUserParams) {
  loading.value = true
  getUsers(config, searchParams).then((res) => {
    console.log(res)
    tableData.splice(0, tableData.length, ...res.data)
    total.value = parseInt(res.headers['x-total'])
    loading.value = false
  })
}

search(searchParams)

const searchClick = () => {
  searchParams.page = 1
  search(searchParams)
}

const sizeChange = (value: number) => {
  searchParams.per_page = value
  search(searchParams)
}

const currentChange = (value: number) => {
  searchParams.page = value
  search(searchParams)
}

const prevClick = (value: number) => {
  searchParams.page = value
  search(searchParams)
}

const nextClick = (value: number) => {
  searchParams.page = value
  search(searchParams)
}

const getCustomAttributes = function (
  values: Array<{ key: string; value: string }>,
  attributeKey: string,
): string | undefined {
  if (!Array.isArray(values)) {
    return undefined
  }
  const item = values.find((item) => item.key === attributeKey)
  if (attributeKey === 'amounts') {
    return item ? '¥' + item.value : undefined
  }
  return item ? item.value : undefined
}

const dateFormatter = (text: string) => {
  const date = new Date(text)
  if (isNaN(date.getTime())) {
    // 或者返回默认值，如 'Invalid Date'
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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

    <el-dialog v-model="dialogVisible" title="自定义属性" width="500" :before-close="handleClose">
      <el-form label-width="auto" style="">
        <el-form-item
          v-for="(item, index) in user?.custom_attributes"
          :key="index"
          :label="item.key"
          label-width="100px"
        >
          <el-input
            @blur="valueBlur"
            :data-key="item.key"
            :class="item.valueClassName"
            v-model="item.value"
            style="width: 150px; margin-right: 15px"
          />
          <el-button type="primary" @click="saveGitLabCustomAttribute(item)">保存</el-button>
          <el-button type="danger" @click="deleteGitLabCustomAttribute(item.key)">删除</el-button>
          <el-icon
            @click="addGitLabCustomAttribute"
            size="32"
            style="cursor: pointer; margin-left: 12px"
          >
            <Plus />
          </el-icon>
          <div v-if="item.valueClassName === validatorErrorClass" class="el-form-item__error">
            value 必填
          </div>
        </el-form-item>

        <el-form-item
          v-for="(item, index) in addCustomAttributes"
          :key="index"
          :label="item.key"
          label-width="100px"
        >
          <template #label>
            <div v-if="item.input" class="el-form-item__content">
              <el-input
                @blur="addKeyBlur"
                :data-id="item.id"
                :class="item.keyClassName"
                v-model="item.key"
              />
              <div v-if="item.keyClassName === validatorErrorClass" class="el-form-item__error">
                key 必填
              </div>
            </div>
            <div v-else>
              {{ item.key }}
            </div>
          </template>
          <el-input
            @blur="addValueBlur"
            :data-id="item.id"
            :class="item.valueClassName"
            v-model="item.value"
            style="width: 150px; margin-right: 15px"
          />
          <el-button type="primary" @click="saveGitLabCustomAttribute(item)">保存</el-button>
          <el-button
            type="danger"
            @click="deleteNullCustomAttribute(item.id)"
            :disabled="
              !user?.custom_attributes.length && item.input && addCustomAttributes.length === 1
            "
            >删除
          </el-button>
          <el-icon
            @click="addGitLabCustomAttribute"
            size="32"
            style="cursor: pointer; margin-left: 12px"
          >
            <Plus />
          </el-icon>
          <div v-if="item.valueClassName === validatorErrorClass" class="el-form-item__error">
            value 必填
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <el-button type="primary" @click="searchClick">搜索</el-button>

    <!-- @current-change="currentChange" -->
    <el-pagination
      size="small"
      background
      layout="sizes, prev, pager, next, jumper"
      :default-page-size="searchParams.per_page"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      @current-change="currentChange"
      @size-change="sizeChange"
      @prev-click="prevClick"
      @next-click="nextClick"
    >
    </el-pagination>
    <el-table v-loading="loading" :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="username" label="username" width="100" />
      <el-table-column prop="name" label="name" width="140" />
      <el-table-column prop="avatar_url" label="avatar" width="70">
        <template #default="{ row }">
          <el-avatar :src="row.avatar_url" />
        </template>
      </el-table-column>
      <el-table-column prop="email" label="email" width="260" />
      <el-table-column prop="state" label="state" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.state === 'blocked'" type="danger">已禁用</el-tag>
          <span v-else><!-- {{ row.state }} --></span>
        </template>
      </el-table-column>
      <el-table-column prop="is_admin" label="is_admin" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.is_admin === true" type="success">管理员</el-tag>
          <span v-else><!-- {{ row.is_admin }} --></span>
        </template>
      </el-table-column>
      <el-table-column prop="two_factor_enabled" label="Two Factor" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.two_factor_enabled === true" type="success">已启用</el-tag>
          <span v-else><!-- {{ row.two_factor_enabled }} --></span>
        </template>
      </el-table-column>
      <!--<el-table-column prop="locked" label="locked" width="80" />-->
      <el-table-column prop="projects_limit" label="Projects Limit" width="120">
        <template #default="{ row }">
          <span :style="{ color: row.projects_limit > 0 ? 'blue' : 'inherit' }">
            {{ row.projects_limit }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="custom_attributes"
        label="UID"
        width="110"
        :formatter="
          (row: any, column: any, cellValue: any, index: number) =>
            getCustomAttributes(cellValue, 'upower')
        "
      />
      <el-table-column
        prop="custom_attributes"
        label="Expires At"
        width="110"
        :formatter="
          (row: any, column: any, cellValue: any, index: number) =>
            getCustomAttributes(cellValue, 'expires_at')
        "
      />
      <el-table-column
        prop="custom_attributes"
        label="days"
        width="60"
        :formatter="
          (row: any, column: any, cellValue: any, index: number) =>
            getCustomAttributes(cellValue, 'days')
        "
      />
      <el-table-column
        prop="custom_attributes"
        label="amounts"
        width="90"
        :formatter="
          (row: any, column: any, cellValue: any, index: number) =>
            getCustomAttributes(cellValue, 'amounts')
        "
      />
      <el-table-column
        prop="created_at"
        label="Created At"
        width="180"
        :formatter="
          (row: any, column: any, cellValue: string, index: number) => dateFormatter(cellValue)
        "
      />
      <el-table-column prop="created_by.name" label="Created By" width="100" />
      <el-table-column
        prop="custom_attributes"
        label="wx"
        width="90"
        :formatter="
          (row: any, column: any, cellValue: any, index: number) =>
            getCustomAttributes(cellValue, 'wx')
        "
      />
      <el-table-column fixed="right" label="Operations" min-width="100">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="customAttributeClick(row.id)"
            >自定义属性
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style>
.validator-error > .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}
</style>
