import axios, { type AxiosResponse } from 'axios'
import type { GitLab } from '@/stores/gitlab.ts'

export interface SetCustomAttributeParams {
  userId: string | number
  attributeKey: string
  value: string | number
}

export interface GetUserParams {
  page: number
  per_page: number
  with_custom_attributes: boolean
}

export interface User {
  id: number
  name: string
}

/**
 * 列出用户：https://gitlab.cn/docs/jh/api/users.html
 */
export async function getUsers(
  config: GitLab,
  params: GetUserParams = { page: 1, per_page: 10, with_custom_attributes: true },
): Promise<AxiosResponse<User[]>> {
  try {
    const url = `${config.domain}/api/v4/users`

    return await axios.get<User[]>(url, {
      headers: {
        'PRIVATE-TOKEN': config.token,
      },
      params: {
        ...params,
      },
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 处理 Axios 错误
      throw new Error(`GitLab API request failed: ${error.message}`)
    }
    throw new Error('Unexpected error occurred')
  }
}

export async function setCustomAttribute(
  config: GitLab,
  params: SetCustomAttributeParams,
): Promise<AxiosResponse> {
  const { userId, attributeKey, value } = params

  try {
    const url = `${config.domain}/api/v4/users/${userId}/custom_attributes/${attributeKey}`

    // 使用 URLSearchParams 处理表单数据
    const formData = new URLSearchParams()
    formData.append('value', value.toString())

    return await axios.put(url, formData, {
      headers: {
        'PRIVATE-TOKEN': config.token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 处理 Axios 错误
      throw new Error(`GitLab API request failed: ${error.message}`)
    }
    throw new Error('Unexpected error occurred')
  }
}
