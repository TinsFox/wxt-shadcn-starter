import { initBackgroundScript } from "@/lib/handle-background-script"
import { fetchData } from "@/lib/task.ts"

export default defineContentScript({
  matches: [
    "https://compass.jinritemai.com/*",
    "https://www.compass.jinritemai.com/*",
  ],
  runAt: "document_end",
  async main() {
    console.log("Content script initialized")

    await injectScript("/inject.js", {
      keepInDom: true,
    })

    // initBackgroundScript()

    // 等待页面加载完成
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve))
    }

    // 监听来自background的消息
    chrome.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        console.log("Content script received message:", message)

        switch (message.type) {
          case "fetchData":
            try {
              const result = await fetchData()
              console.log("Fetch data result:", result)
              sendResponse({ success: true, data: result })
            } catch (error) {
              console.error("Error fetching data:", error)
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              })
            }
            break

          // 添加其他消息类型的处理
          case "hover":
          case "date":
          case "setConfig":
          case "money":
          case "getAlarms":
            console.log(`Handling ${message.type} message`)
            // 在这里添加相应的处理逻辑
            sendResponse({ success: true, message: `Handled ${message.type}` })
            break
        }

        return true // 保持消息通道开启
      }
    )
  },
})
