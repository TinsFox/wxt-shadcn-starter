export function defineJobs() {
  // 添加一个变量来追踪上次执行时间
  let lastExecutionTime = 0
  const MIN_INTERVAL = 5 * 60 * 1000 // 最小间隔时间（5分钟）

  // 删除所有现有的定时任务
  chrome.alarms.clearAll()

  // 计算下一个11点的时间
  const next11AM = new Date()
  next11AM.setHours(11, 0, 0, 0)
  if (next11AM.getTime() < Date.now()) {
    next11AM.setDate(next11AM.getDate() + 1)
  }

  // 计算下一个12点的时间
  const next12PM = new Date()
  next12PM.setHours(12, 0, 0, 0)
  if (next12PM.getTime() < Date.now()) {
    next12PM.setDate(next12PM.getDate() + 1)
  }

  // 创建11点的定时任务
  chrome.alarms.create("fetchData11AM", {
    when: next11AM.getTime(),
    periodInMinutes: 24 * 60, // 每24小时执行一次
  })

  // 创建12点的定时任务
  chrome.alarms.create("fetchData12PM", {
    when: next12PM.getTime(),
    periodInMinutes: 24 * 60, // 每24小时执行一次
  })

  // 创建测试用的定时任务 - 每2分钟执行一次
  // chrome.alarms.create("fetchDataTest", {
  //   periodInMinutes: 2,
  //   when: Date.now() + 1000, // 1秒后开始第一次执行
  // });

  // 监听定时任务
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log("Alarm triggered:", alarm.name)

    if (
      alarm.name === "fetchData11AM" ||
      alarm.name === "fetchData12PM" ||
      alarm.name === "fetchDataTest"
    ) {
      // 检查是否可以执行
      const now = Date.now()
      if (now - lastExecutionTime < MIN_INTERVAL) {
        console.log("Skipping execution due to minimum interval not met")
        return
      }

      lastExecutionTime = now

      // 创建新标签页
      chrome.tabs.create(
        {
          url: "https://compass.jinritemai.com/shop/talent-list",
          active: true,
        },
        (tab) => {
          if (!tab.id) return

          let retryCount = 0
          const MAX_RETRIES = 3

          const checkAndSendMessage = () => {
            if (retryCount >= MAX_RETRIES) {
              console.log("Max retries reached, giving up")
              if (tab.id) chrome.tabs.remove(tab.id)
              return
            }

            if (tab.id) {
              console.log("tab.id", tab.id)
              chrome.tabs.sendMessage(
                tab.id,
                { type: "fetchData" },
                (response) => {
                  console.log("response: ", response)
                  // if (chrome.runtime.lastError) {
                  //   // 如果页面还没准备好，等待后重试
                  //   retryCount++;
                  //   setTimeout(checkAndSendMessage, 2000);
                  // } else {
                  //   console.log("Received response from new tab:", response);
                  //   // 数据抓取完成后关闭标签页
                  //   if (response?.success) {
                  //     setTimeout(() => {
                  //       if (tab.id) chrome.tabs.remove(tab.id);
                  //     }, 5000);
                  //   } else {
                  //     // 如果失败了，也要关闭标签页
                  //     if (tab.id) chrome.tabs.remove(tab.id);
                  //   }
                  // }
                }
              )
            }
          }

          // 给页面一些加载时间
          setTimeout(checkAndSendMessage, 5000)
        }
      )
    }
  })
}
