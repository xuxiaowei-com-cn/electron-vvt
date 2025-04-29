import axios, { type AxiosResponse } from 'axios'
import type { GitLab } from '@/stores/gitlab.ts'

export interface SetCustomAttributeParams {
  userId: string | number
  attributeKey: string
  value: string | number
}

export async function setGitLabCustomAttribute(
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
