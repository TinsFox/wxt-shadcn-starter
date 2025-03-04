import { getStartedPage } from "@/lib/get-started-page";
import { defineJobs } from "@/lib/jobs";

export default defineBackground({
  async main() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    });
    getStartedPage();
    defineJobs();

    // 统一处理发送消息到content script的函数
    const sendMessageToActiveTab = (message: any, sendResponse: any) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) {
          console.error("No active tab found");
          sendResponse({ success: false, error: "No active tab found" });
          return;
        }

        console.log("Sending message to content script:", message);
        chrome.tabs.sendMessage(activeTab.id, message, (response) => {
          console.log(
            "Background received response from content script:",
            response,
          );
          sendResponse(response);
        });
      });
    };

    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Background received message:", message);

      switch (message.type) {
        case "fetchData":
        case "hover":
        case "date":
        case "setConfig":
        case "money":
        case "getAlarms":
          sendMessageToActiveTab(message, sendResponse);
          return true; // 保持消息通道开启
      }
    });
  },
});
