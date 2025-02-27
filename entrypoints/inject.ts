//
import { findMatchingInterceptor } from "@/lib/Interceptor";

export default defineUnlistedScript(async () => {
  console.log("Injecting script...");
  const OriginalXHR = window.XMLHttpRequest;
  // 创建 XMLHttpRequest 的代理处理器
  const xhrHandler = {
    construct(target: typeof XMLHttpRequest, args: any[]) {
      const xhr = new OriginalXHR();
      const originalOpen = xhr.open.bind(xhr);
      const originalSend = xhr.send.bind(xhr);
      let currentUrl: string = "";
      let currentMethod: string = "";

      // 代理 open 方法
      xhr.open = function (
        method: string,
        url: string | URL,
        async?: boolean,
        username?: string | null,
        password?: string | null,
      ) {
        currentUrl = url.toString();
        currentMethod = method;
        return originalOpen(method, url, async ?? true, username, password);
      };

      // 代理 send 方法
      xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        xhr.addEventListener("load", function () {
          try {
            handleXHRResponse(xhr, currentMethod);
          } catch (error) {
            console.log("error: ", error);
          }
        });
        return originalSend(body);
      };
      return xhr;
    },
  };
  // 使用 Proxy 替换原始的 XMLHttpRequest
  window.XMLHttpRequest = new Proxy(OriginalXHR, xhrHandler) as any;
  console.log("Script injected successfully");
});
const handleXHRResponse = (xhr: XMLHttpRequest, method: string) => {
  // 从 xhr 对象中获取 URL
  const currentUrl = xhr.responseURL;

  // 解析响应数据
  let response: any;
  if (xhr.responseType === "json") {
    response = xhr.response;
  } else {
    try {
      response = JSON.parse(xhr.responseText);
    } catch {
      response = xhr.responseText;
    }
  }

  const interceptor = findMatchingInterceptor(currentUrl);
  if (!interceptor) return;

  console.log(`触发拦截器: ${interceptor.name}`);
  const baseRequestInfo = {
    url: currentUrl,
    method: method,
    response: response,
    status: xhr.status,
    headers: xhr.getAllResponseHeaders(),
  };

  try {
    const urlObj = new URL(currentUrl);
    interceptor.onResponse?.({
      params: urlObj.searchParams,
      response: baseRequestInfo,
    });
  } catch (error) {
    console.error("拦截出错 : ", error);
    // 如果 URL 无效，则传入基本信息
    interceptor.onResponse?.({
      response: baseRequestInfo,
      params: new URLSearchParams(),
    });
  }
};
