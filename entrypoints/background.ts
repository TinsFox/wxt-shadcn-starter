import { initAlarm } from "../lib/alarms"

export default defineBackground({
  async main() {
    // await initAlarm()

    // 发送debugger命令的辅助函数
    function sendDebugCommand(tabId: number, method: string, params = {}) {
      return new Promise((resolve) => {
        chrome.debugger.sendCommand({ tabId }, method, params, resolve)
      })
    }

    // 附加debugger的辅助函数
    function attachDebugger(tabId: number, prevTab?: number) {
      return new Promise((resolve) => {
        if (prevTab && tabId !== prevTab) {
          chrome.debugger.detach({ tabId: prevTab })
        }

        chrome.debugger.attach({ tabId }, "1.3", () => {
          resolve(true)
        })
      })
    }

    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

            // 断开 debugger
            chrome.debugger.detach({ tabId })

            sendResponse({ success: true, result })
          } catch (error) {
            console.error("Error in debugger command:", error)
            sendResponse({ success: false, error: error.message })
          }
        })()

        return true // 保持消息通道开启
      }
    })
  },
})
