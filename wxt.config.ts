import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: [
      "storage",
      "tabs",
      "sidePanel",
      "alarms",
      "webRequest",
      "webRequestBlocking",
      "debugger",
      "scripting",
      "activeTab",
    ],
    host_permissions: [
      "https://compass.jinritemai.com/*",
      "https://e-commerce-test.xiaofeilun.cn/e-commerce-api/**",
      "http://localhost:8787/*",
    ],
    web_accessible_resources: [
      {
        resources: ["douyin-main-world.js", "/inject.js"],
        matches: ["<all_urls>"],
      },
    ],
  },
})
