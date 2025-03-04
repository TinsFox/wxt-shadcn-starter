import { registerJobScheduler } from "@/lib/job-scheduler"
import { fetchData } from "@/lib/task"

export async function defineJobs() {
  const jobs = registerJobScheduler()
  await jobs.scheduleJob({
    id: "fetchData11",
    type: "cron",
    expression: "0 11 * * *",
    execute: async () => {
      await fetchData()
    },
  })
  await jobs.scheduleJob({
    id: "fetchData12",
    type: "cron",
    expression: "0 12 * * *",
    execute: async () => {
      await fetchData()
    },
  })
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
  //   },
  // });
}
