// 处理 XHR 响应的方法
export const handleXHRResponse = (xhr: XMLHttpRequest, method: string) => {
  // 从 xhr 对象中获取 URL
  const currentUrl = xhr.responseURL

  // 解析响应数据
  let response: any
  if (xhr.responseType === "json") {
    response = xhr.response
  } else {
    try {
      response = JSON.parse(xhr.responseText)
    } catch {
      response = xhr.responseText
    }
  }

  const interceptor = findMatchingInterceptor(currentUrl)
  if (!interceptor) return
  console.log("xhr: ", xhr)

  console.log(`触发拦截器: ${interceptor.name}`)
  const baseRequestInfo = {
    url: currentUrl,
    method: method,
    response: response,
    status: xhr.status,
    headers: xhr.getAllResponseHeaders(),
  }

  try {
    const urlObj = new URL(currentUrl)
    console.log('urlObj: ', urlObj);
    console.log('urlObj: ', urlObj.searchParams);
    const params = urlObj.searchParams;

    // 将看到所有参数
    console.log(Object.fromEntries(params));
    interceptor.onResponse?.({
      ...baseRequestInfo,
      queryParams: urlObj.searchParams,
    })
  } catch (error) {
    // 如果 URL 无效，则传入基本信息
    interceptor.onResponse?.(baseRequestInfo)
  }
}
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
      console.log("处理作者合作列表数据:", response)
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
