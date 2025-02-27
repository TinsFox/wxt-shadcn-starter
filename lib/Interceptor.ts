// 处理 XHR 响应的方法
import dayjs from "dayjs";
import { apiFetch } from "./api-fetch";
import { sendMessage } from "./messaging";

export const handleXHRResponse = (xhr: XMLHttpRequest, method: string) => {
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
export interface Interceptor {
  name: string;
  url: string | RegExp;
  onResponse?: ({
    response,
    params,
  }: {
    response: any;
    params: URLSearchParams;
  }) => void;
}
// 拦截器列表
export const interceptors: Interceptor[] = [
  {
    name: "作者合作列表",
    url: "https://compass.jinritemai.com/compass_api/shop/author/cooperate/list",
    onResponse: async ({ params, response }) => {
      if (!params) {
        throw new Error("params is null");
      }
      const paramsObj = Object.fromEntries(params);
      const { date_type, end_date } = paramsObj;
      if (date_type === "2") {
        const { data } = response.response;
        const { data_head, data_result } = data;
        const result = await apiFetch(
          "/shop-expert/saveBORFDouShopExpertsByPlugIn",
          {
            method: "POST",
            body: {
              shop_name: "BORF宠物食品旗舰店",
              day: dayjs(end_date).format("YYYY-MM-DD"),
              data_head,
              data_result,
            },
          },
        );
        console.log("result: ", result);
      }
    },
  },
];

// 根据 URL 查找匹配的拦截器
export function findMatchingInterceptor(url: string): Interceptor | undefined {
  try {
    // 尝试创建完整 URL
    const urlObj = new URL(url);

    return interceptors.find((interceptor) => {
      if (typeof interceptor.url === "string") {
        const interceptorUrl = new URL(interceptor.url);
        return interceptorUrl.pathname === urlObj.pathname;
      }
      return interceptor.url.test(url);
    });
  } catch {
    // 如果 URL 构造失败，说明可能是相对路径
    // 获取路径部分（移除查询参数）
    const pathname = url.split("?")[0];

    return interceptors.find((interceptor) => {
      if (typeof interceptor.url === "string") {
        const interceptorUrl = new URL(interceptor.url);
        return interceptorUrl.pathname === pathname;
      }
      return interceptor.url.test(url);
    });
  }
}
