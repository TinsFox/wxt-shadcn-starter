import { wait } from "@/lib/utils"
import { attachDebugger, sendDebugCommand } from "@/lib/debug"
import { getStartedPage } from "@/lib/get-started-page"
import { defineJobs } from "@/lib/jobs"

export default defineBackground({
  async main() {
    getStartedPage()
    defineJobs()
    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("content script message: ", message)
      if (message.type === "debugger:send-command") {
        const tabId = sender.tab?.id
        if (!tabId) {
          sendResponse({ error: "No tab ID found" })
          return true
        }
        // 使用 async/await 处理异步操作
        ;(async () => {
          try {
            await attachDebugger(tabId)

            const result = await sendDebugCommand(
              tabId,
              message.method,
              message.params
            )
            await wait(1000)
            // 断开 debugger
            await chrome.debugger.detach({ tabId })

            sendResponse({ success: true, result })
          } catch (error: any) {
            console.error("Error in debugger command:", error)
            sendResponse({ success: false, error: error.message })
          }
        })()

        return true // 保持消息通道开启
      }
      if (message.type === "fetchData") {
        console.log("Fetching data from background...")
        // 获取当前活动标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0]
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" })
            return
          }

          // 发送消息给content script
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "fetchData",
            },
            (response) => {
              // 将content script的响应传回popup
              sendResponse(response)
            }
          )
        })
        return true // 保持消息通道开启
      }
      if (message.type === "hover") {
        // 获取当前活动标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0]
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" })
            return
          }

          // 发送消息给content script
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "hover",
            },
            (response) => {
              // 将content script的响应传回popup
              sendResponse(response)
            }
          )
        })
        return true // 保持消息通道开启
      }
      if (message.type === "date") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0]
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" })
            return
          }

          // 发送消息给content script
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "date",
            },
            (response) => {
              // 将content script的响应传回popup
              sendResponse(response)
            }
          )
        })
        return true
      }
      if (message.type === "date") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0]
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" })
            return
          }
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "date",
            },
            (response) => {
              sendResponse(response)
            }
          )
        })
        return true
      }
    })
    browser.runtime.onMessage.addListener(async (message) => {
      console.log("background message: ", message)
      // Grab tabs matching content scripts
      const allTabs = await browser.tabs.query({})
      const contentScriptMatches = new MatchPattern("*://*/*")
      const contentScriptTabs = allTabs.filter(
        (tab) =>
          tab.id != null &&
          tab.url != null &&
          contentScriptMatches.includes(tab.url)
      )

      // Forward message to tabs, collecting the responses
      const responses = await Promise.all(
        contentScriptTabs.map(async (tab) => {
          if (!tab.id) {
            return { tab: tab.id, response: { error: "No tab ID found" } }
          }
          const response = await browser.tabs.sendMessage(tab.id, message)
          return { tab: tab.id, response }
        })
      )

      // Return an array of all responses back to popup.
      return responses
    })
  },
})
