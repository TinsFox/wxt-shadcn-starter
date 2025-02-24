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
    host_permissions: ["*://compass.jinritemai.com/*"],
    web_accessible_resources: [
      {
        resources: ["douyin-main-world.js"],
        matches: ["*://*/*"],
      },
    ],
  },
})
