// entrypoints/example-main-world.ts
import { findMatchingInterceptor } from "../lib/Interceptor"

export default defineUnlistedScript(() => {
  // 保存原始的 XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest
  // 重写 XMLHttpRequest
  window.XMLHttpRequest = function () {
    const xhr = new OriginalXHR()
    const originalOpen = xhr.open.bind(xhr)
    const originalSend = xhr.send.bind(xhr)
    let currentUrl: string = ""
    // 重写 open 方法
    xhr.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      currentUrl = url.toString()
      return originalOpen(method, url, async ?? true, username, password)
    }
    // 重写 send 方法
    xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      // 监听请求完成
      xhr.addEventListener("load", function () {
        try {
          let response: any

          // 根据响应类型处理数据
          if (xhr.responseType === "json") {
            response = xhr.response
          } else {
            // 尝试解析为 JSON，如果失败则使用原始响应
            try {
              response = JSON.parse(xhr.responseText)
            } catch {
              response = xhr.responseText
            }
          }

          // 查找匹配的拦截器并处理响应
          const interceptor = findMatchingInterceptor(currentUrl)
          if (interceptor) {
            console.log(`触发拦截器: ${interceptor.name}`)
            try {
              const urlObj = new URL(currentUrl)
              interceptor.onResponse?.(response, urlObj.searchParams)
            } catch {
              // 如果 URL 无效，则不传入查询参数
              interceptor.onResponse?.(response)
            }
          }
        } catch (error) {
          console.log("error: ", error)
        }
      })
      return originalSend(body)
    }
    return xhr
  } as unknown as typeof XMLHttpRequest
})
