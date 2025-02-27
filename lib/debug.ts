// 处理悬浮元素的后台逻辑
export async function handleHoverElement(block: { tabId: number }) {
  try {
    // 确保已经附加了debugger
    await attachDebugger(block.tabId);

    // 发送消息给content script执行悬浮操作
    await chrome.tabs.sendMessage(block.tabId, {
      type: "HOVER_ELEMENT",
      data: block,
    });

    // 如果不需要持续debug模式，可以断开debugger
    chrome.debugger.detach({ tabId: block.tabId });

    return { success: true };
  } catch (error) {
    console.error("Hover element error:", error);
    throw error;
  }
}

// 附加debugger的辅助函数
export function attachDebugger(tabId: number, prevTab?: number) {
  return new Promise((resolve) => {
    if (prevTab && tabId !== prevTab) {
      chrome.debugger.detach({ tabId: prevTab });
    }

    chrome.debugger.attach({ tabId }, "1.3", () => {
      resolve(true);
    });
  });
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "debugger:send-command") {
    chrome.debugger.sendCommand(
      { tabId: message.tabId },
      message.method,
      message.params,
      sendResponse,
    );
    return true; // 保持消息通道开启
  }
});
// 发送debugger命令的辅助函数
export function sendDebugCommand(tabId: number, method: string, params = {}) {
  return new Promise((resolve) => {
    chrome.debugger.sendCommand({ tabId }, method, params, resolve);
  });
}
