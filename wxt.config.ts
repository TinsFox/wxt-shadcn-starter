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
    ],
    host_permissions: ["*://compass.jinritemai.com/*"],
    web_accessible_resources: [
      {
        resources: ["example-main-world.js"],
        matches: ["*://*/*"],
      },
    ],
  },
})
