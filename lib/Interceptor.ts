// 定义拦截器接口
export interface Interceptor {
  name: string
  url: string | RegExp
  onResponse?: (response: any, params?: URLSearchParams) => void
}

// 拦截器列表
export const interceptors: Interceptor[] = [
  {
    name: "作者合作列表",
    url: "https://compass.jinritemai.com/compass_api/shop/author/cooperate/list",
    onResponse: (response, params) => {
      // 可以获取查询参数
      const pageNo = params?.get("page_no")
      const pageSize = params?.get("page_size")
      console.log("处理作者合作列表数据:", response, { pageNo, pageSize })
    },
  },
]

// 根据 URL 查找匹配的拦截器
export function findMatchingInterceptor(url: string): Interceptor | undefined {
  try {
    // 尝试创建完整 URL
    const urlObj = new URL(url)

    return interceptors.find((interceptor) => {
      if (typeof interceptor.url === "string") {
        const interceptorUrl = new URL(interceptor.url)
        return interceptorUrl.pathname === urlObj.pathname
      }
      return interceptor.url.test(url)
    })
  } catch {
    // 如果 URL 构造失败，说明可能是相对路径
    // 获取路径部分（移除查询参数）
    const pathname = url.split("?")[0]

    return interceptors.find((interceptor) => {
      if (typeof interceptor.url === "string") {
        const interceptorUrl = new URL(interceptor.url)
        return interceptorUrl.pathname === pathname
      }
      return interceptor.url.test(url)
    })
  }
}
