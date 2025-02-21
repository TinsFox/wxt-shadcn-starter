import { hoverElement } from "./element"

export function initBackgroundScript() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "HOVER_ELEMENT") {
      hoverElement(message.data.selector)
        .then(() => sendResponse({ success: true }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        )
      return true // 保持消息通道开启
    }
  })
}
