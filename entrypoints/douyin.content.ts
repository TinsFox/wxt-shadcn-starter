import {
  findAndClickCheckbox,
  findAndClickConfirmButton,
  findAndClickConfigElement,
  hoverElement,
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
      try {
        await hoverElement(
          '//*[@id="root"]/div[1]/div/div[2]/div/div[2]/div/div/label[4]',
          true
        )
        console.log("成功触发悬停事件")
      } catch (error) {
        console.error("触发悬停事件失败:", error)
      }
      await wait(3000)

      // 选择日期
      await selectDateFromCalendar(date)
      await wait(3000)

      // 处理当天的所有分页数据
      await autoClickNextPage()
      await wait(3000) // 等待一下再处理下一天
    }

    console.log("Done!")
  },
})
