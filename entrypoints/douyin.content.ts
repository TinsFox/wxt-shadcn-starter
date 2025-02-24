import {
  findAndClickCheckbox,
  findAndClickConfirmButton,
  findAndClickConfigElement,
  selectDateFromCalendar,
  autoClickNextPage,
} from "@/lib/element.ts"
import { initBackgroundScript } from "@/lib/handle-background-script"
import { wait } from "@/lib/utils.ts"
import { TaskQueue } from "@/lib/queue.ts"
import dayjs from "dayjs"

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...")
    await injectScript("/inject.js", {
      keepInDom: true,
    })

    initBackgroundScript()
    // 等待页面加载完成
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve))
    }

    const queue = new TaskQueue({
      maxRetries: 3,
      defaultDelay: 3000,
      onError: (error, taskName) => {
        console.error(`Task ${taskName} failed:`, error)
      },
      onSuccess: (_, taskName) => {
        console.log(`Task ${taskName} completed successfully`)
      },
      onComplete: (results) => {
        console.log("All tasks completed:", results)
      },
    })

    // 初始配置任务
    queue
      .addTask({
        name: "Initial wait",
        execute: () => wait(3000),
      })
      .addTask({
        name: "Click config element",
        execute: () => findAndClickConfigElement(),
      })
      .addTask({
        name: "Click checkbox",
        execute: () => findAndClickCheckbox(),
      })
      .addTask({
        name: "Click confirm button",
        execute: () => findAndClickConfirmButton(),
      })

    // 获取前三天的日期
    const dates = Array.from({ length: 3 }, (_, i) => {
      return dayjs()
        .subtract(i + 1, "day")
        .format("DD")
    })

    // 添加每天的数据处理任务
    for (const date of dates) {
      queue
        .addTask({
          name: `Select date ${date}`,
          execute: () => selectDateFromCalendar(date),
        })
        .addTask({
          name: `Process pages for date ${date}`,
          execute: () => autoClickNextPage(),
          delay: 60000, // 等待一分钟再处理下一天
        })
    }

    try {
      const results = await queue.start()
      console.log("All tasks completed:", results)
    } catch (error) {
      console.error("Queue execution failed:", error)
    }

    console.log("Done!")
  },
})
