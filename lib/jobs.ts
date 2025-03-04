import { registerJobScheduler } from "@/lib/job-scheduler";
import { fetchData } from "@/lib/task";

export function defineJobs() {
  // 删除所有现有的定时任务
  chrome.alarms.clearAll();

  // 计算下一个11点的时间
  const next11AM = new Date();
  next11AM.setHours(11, 0, 0, 0);
  if (next11AM.getTime() < Date.now()) {
    next11AM.setDate(next11AM.getDate() + 1);
  }

  // 计算下一个12点的时间
  const next12PM = new Date();
  next12PM.setHours(12, 0, 0, 0);
  if (next12PM.getTime() < Date.now()) {
    next12PM.setDate(next12PM.getDate() + 1);
  }

  // 创建11点的定时任务
  chrome.alarms.create("fetchData11AM", {
    when: next11AM.getTime(),
    periodInMinutes: 24 * 60, // 每24小时执行一次
  });

  // 创建12点的定时任务
  chrome.alarms.create("fetchData12PM", {
    when: next12PM.getTime(),
    periodInMinutes: 24 * 60, // 每24小时执行一次
  });

  // 创建测试用的定时任务 - 每2分钟执行一次
  // chrome.alarms.create("fetchDataTest", {
  //   periodInMinutes: 2,
  //   when: Date.now() + 1000, // 1秒后开始第一次执行
  // });

  // 监听定时任务
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log("Alarm triggered:", alarm.name);

    if (
      alarm.name === "fetchData11AM" ||
      alarm.name === "fetchData12PM" ||
      alarm.name === "fetchDataTest"
    ) {
      // 获取所有匹配的标签页
      const tabs = await chrome.tabs.query({
        url: [
          "https://compass.jinritemai.com/*",
          "https://www.compass.jinritemai.com/*",
        ],
      });

      // 如果找到匹配的标签页，发送消息给content script
      if (tabs.length > 0) {
        const tab = tabs[0];
        if (tab.id) {
          console.log("Sending fetchData message to tab:", tab.id);
          chrome.tabs.sendMessage(tab.id, { type: "fetchData" }, (response) => {
            console.log(
              "Received response from scheduled fetchData:",
              response,
            );
          });
        }
      } else {
        console.log("No matching tab found for scheduled fetchData");
        // 如果没有找到匹配的标签页，创建新标签页
        chrome.tabs.create(
          {
            url: "https://compass.jinritemai.com/shop/talent-list",
            active: false,
          },
          (tab) => {
            // 等待页面加载完成后发送消息
            const checkAndSendMessage = () => {
              if (tab.id) {
                chrome.tabs.sendMessage(
                  tab.id,
                  { type: "fetchData" },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      // 如果页面还没准备好，等待后重试
                      setTimeout(checkAndSendMessage, 1000);
                    } else {
                      console.log("Received response from new tab:", response);
                      // 数据抓取完成后关闭标签页
                      setTimeout(() => {
                        if (tab.id) chrome.tabs.remove(tab.id);
                      }, 5000);
                    }
                  },
                );
              }
            };

            // 给页面一些加载时间
            setTimeout(checkAndSendMessage, 5000);
          },
        );
      }
    }
  });
}
