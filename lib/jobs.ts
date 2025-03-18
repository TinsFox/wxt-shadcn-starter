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
  chrome.alarms.create("fetchDataTest", {
    periodInMinutes: 2,
    when: Date.now() + 1000, // 1秒后开始第一次执行
  });

  // 监听定时任务
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log("Alarm triggered:", alarm.name);

    if (
      alarm.name === "fetchData11AM" ||
      alarm.name === "fetchData12PM" ||
      alarm.name === "fetchDataTest"
    ) {
      // 创建新标签页
      chrome.tabs.create(
        {
          url: "https://compass.jinritemai.com/shop/talent-list",
          active: true,
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
  });
}
