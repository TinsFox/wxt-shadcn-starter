import {
  findAndClickCheckbox,
  findAndClickConfirmButton,
  findAndClickConfigElement,
  selectDateFromCalendar,
  autoClickNextPage,
} from "@/lib/element.ts"
import { initBackgroundScript } from "@/lib/handle-background-script"
import { wait } from "@/lib/utils.ts"
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

    await wait(3000)
    // 第一次执行的配置操作
    await findAndClickConfigElement()
    await wait(3000)
    await findAndClickCheckbox()
    await wait(1000)
    await findAndClickConfirmButton()
    await wait(3000)

    // 获取前三天的日期
    const dates = Array.from({ length: 3 }, (_, i) => {
      return dayjs()
        .subtract(i + 1, "day")
        .format("DD")
    })

    // 处理每一天的数据
    for (const date of dates) {
      // 选择日期（现在包含了悬停功能）
      await selectDateFromCalendar(date)
      await wait(3000)

      // 处理当天的所有分页数据
      await autoClickNextPage()
      await wait(1000 * 60) // 等待一下再处理下一天
    }

    console.log("Done!")
  },
})
