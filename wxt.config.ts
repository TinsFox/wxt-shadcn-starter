import dayjs from "dayjs";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "抖音爬虫插件",
    permissions: [
      "storage",
      "tabs",
      "sidePanel",
      "alarms",
      "webRequest",
      // "webRequestBlocking",
      "debugger",
      "scripting",
      "activeTab",
      "notifications",
    ],
    host_permissions: [
      "https://compass.jinritemai.com/*",
      "https://e-commerce-test.xiaofeilun.cn/e-commerce-api/**",
      "http://localhost:8787/*",
    ],
    web_accessible_resources: [
      {
        resources: ["douyin-main-world.js", "/inject.js", "style.css"],
        matches: ["<all_urls>"],
      },
    ],
  },
  vite: () => ({
    define: {
      buildTime: JSON.stringify(dayjs().format("YYYY-MM-DD HH:mm:ss")),
    },
  }),
});
