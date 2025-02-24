import {
  findAndClickCheckbox,
  findAndClickConfirmButton,
  findAndClickConfigElement,
  hoverElement,
  selectDateFromCalendar,
} from "@/lib/element.ts"
import { initBackgroundScript } from "@/lib/handle-background-script"
import { wait } from "@/lib/utils.ts"

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...")
    await injectScript("/douyin-main-world.js", {
      keepInDom: true,
    })
    initBackgroundScript()
    // 等待页面加载完成
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve))
    }

    await wait(3000)
    // 点击配置列表项
    await findAndClickConfigElement()
    await wait(3000)
    // 点击实际佣金支出复选框
    await findAndClickCheckbox()
    await wait(1000)
    // 点击确定按钮
    await findAndClickConfirmButton()
    await wait(3000)
    // 处理元素悬浮的内容脚本
    // 监听来自background script的消息
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
    await selectDateFromCalendar("23")
    console.log("Done!")
  },
})
