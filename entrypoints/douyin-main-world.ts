// entrypoints/douyin-main-world.ts
import { handleXHRResponse } from "../lib/Interceptor"

export default defineUnlistedScript(() => {
  console.log("Injecting script...")
  const OriginalXHR = window.XMLHttpRequest

  // 创建 XMLHttpRequest 的代理处理器
  const xhrHandler = {
    construct(target: typeof XMLHttpRequest, args: any[]) {
      const xhr = new OriginalXHR()
      const originalOpen = xhr.open.bind(xhr)
      const originalSend = xhr.send.bind(xhr)
      let currentUrl: string = ""
      let currentMethod: string = ""

      // 代理 open 方法
      xhr.open = function (
        method: string,
        url: string | URL,
        async?: boolean,
        username?: string | null,
        password?: string | null
      ) {
        currentUrl = url.toString()
        currentMethod = method
        return originalOpen(method, url, async ?? true, username, password)
      }

      // 代理 send 方法
      xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        xhr.addEventListener("load", function () {
          try {
            handleXHRResponse(xhr, currentMethod)
          } catch (error) {
            console.log("error: ", error)
          }
        })
        return originalSend(body)
      }
      return xhr
    },
  }
  // 使用 Proxy 替换原始的 XMLHttpRequest
  window.XMLHttpRequest = new Proxy(OriginalXHR, xhrHandler) as any
  console.log("Script injected successfully")
})
