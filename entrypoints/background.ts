import { showNotification, wait } from "@/lib/utils";
import { apiFetch } from "../lib/api-fetch";
import { onMessage, sendMessage } from "@/lib/messaging";
import { attachDebugger, sendDebugCommand } from "@/lib/debug";
import { fetchData } from "@/lib/task";
import { registerJobScheduler } from "@/lib/job-scheduler";

export default defineBackground({
  async main() {
    browser.runtime.onInstalled.addListener(async ({ reason }) => {
      if (reason !== "install") return;

      // Open a tab on install
      await browser.tabs.create({
        url: browser.runtime.getURL("/get-started.html"),
        active: true,
      });
    });
    const jobs = registerJobScheduler();
    await jobs.scheduleJob({
      id: "fetchData11",
      type: "cron",
      expression: "0 11 * * *",
      execute: async () => {
        await fetchData();
      },
    });
    await jobs.scheduleJob({
      id: "fetchData12",
      type: "cron",
      expression: "0 12 * * *",
      execute: async () => {
        await fetchData();
      },
    });
    // await jobs.scheduleJob({
    //   id: "test",
    //   type: "cron",
    //   expression: "*/2 * * * *",
    //   execute: async () => {
    //     chrome.tabs.create({
    //       url: "https://compass.jinritemai.com/shop/talent-list",
    //       active: true, // 是否立即切换到新标签页
    //       pinned: false, // 是否固定标签页
    //       index: 0, // 新标签页的位置（0表示最左边）
    //     });
    //     console.log("show test notification");
    //     showNotification();
    //   },
    // });

    onMessage("saveShopExpertData", async (data) => {
      console.log("saveShopExpertData: ", data);
      const result = await apiFetch(
        "/shop-expert/saveBORFDouShopExpertsByPlugIn",
        {
          method: "POST",
          body: data,
        },
      );
      console.log("result: ", result);
    });
    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("content script message: ", message);
      if (message.type === "debugger:send-command") {
        const tabId = sender.tab?.id;
        if (!tabId) {
          sendResponse({ error: "No tab ID found" });
          return true;
        }
        // 使用 async/await 处理异步操作
        (async () => {
          try {
            await attachDebugger(tabId);

            const result = await sendDebugCommand(
              tabId,
              message.method,
              message.params,
            );
            await wait(1000);
            // 断开 debugger
            await chrome.debugger.detach({ tabId });

            sendResponse({ success: true, result });
          } catch (error: any) {
            console.error("Error in debugger command:", error);
            sendResponse({ success: false, error: error.message });
          }
        })();

        return true; // 保持消息通道开启
      }

      // 处理保存店铺专家数据的消息
      if (message.type === "save-shop-expert-data") {
        (async () => {
          try {
            const result = await apiFetch(
              "/shop-expert/saveBORFDouShopExpertsByPlugIn",
              {
                method: "POST",
                body: message.payload,
              },
            );
            sendResponse({ success: true, result });
          } catch (error: any) {
            console.error("Error saving shop expert data:", error);
            sendResponse({ success: false, error: error.message });
          }
        })();
        return true; // 保持消息通道开启
      }

      if (message.type === "fetchData") {
        console.log("Fetching data from background...");
        // 获取当前活动标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" });
            return;
          }

          // 发送消息给content script
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "fetchData",
            },
            (response) => {
              // 将content script的响应传回popup
              sendResponse(response);
            },
          );
        });
        return true; // 保持消息通道开启
      }
      if (message.type === "hover") {
        // 获取当前活动标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" });
            return;
          }

          // 发送消息给content script
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "hover",
            },
            (response) => {
              // 将content script的响应传回popup
              sendResponse(response);
            },
          );
        });
        return true; // 保持消息通道开启
      }
      if (message.type === "date") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" });
            return;
          }

          // 发送消息给content script
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "date",
            },
            (response) => {
              // 将content script的响应传回popup
              sendResponse(response);
            },
          );
        });
        return true;
      }
      if (message.type === "date") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (!activeTab || !activeTab.id) {
            sendResponse({ success: false, error: "No active tab found" });
            return;
          }
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              type: "date",
            },
            (response) => {
              sendResponse(response);
            },
          );
        });
        return true;
      }
    });
    browser.runtime.onMessage.addListener(async (message) => {
      console.log("background message: ", message);
      // Grab tabs matching content scripts
      const allTabs = await browser.tabs.query({});
      const contentScriptMatches = new MatchPattern("*://*/*");
      const contentScriptTabs = allTabs.filter(
        (tab) =>
          tab.id != null &&
          tab.url != null &&
          contentScriptMatches.includes(tab.url),
      );

      // Forward message to tabs, collecting the responses
      const responses = await Promise.all(
        contentScriptTabs.map(async (tab) => {
          if (!tab.id) {
            return { tab: tab.id, response: { error: "No tab ID found" } };
          }
          const response = await browser.tabs.sendMessage(tab.id, message);
          return { tab: tab.id, response };
        }),
      );

      // Return an array of all responses back to popup.
      return responses;
    });
  },
});
