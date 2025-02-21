import { hoverElement } from "@/lib/element.ts"
import { initBackgroundScript } from "@/lib/handle-background-script"
import { wait } from "@/lib/utils.ts"

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...")
    await injectScript("/example-main-world.js", {
      keepInDom: true,
    })
    initBackgroundScript()
    // 等待页面加载完成
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve))
    }
    await wait(5000)
    // await findAndClickElement()
    // await wait(3000)
    // await findAndClickCheckbox()
    // await wait(1000)
    // await findAndClickConfirmButton()
    // await wait(3000)
    // await findAndClickRadioButton()
    await wait(1000)
    // 处理元素悬浮的内容脚本
    // 监听来自background script的消息

    // 测试 XPath 悬停
    await wait(2000) // 等待页面完全加载
    try {
      await hoverElement(
        '//*[@id="root"]/div[1]/div/div[2]/div/div[2]/div/div/label[4]',
        true
      )
      console.log("成功触发悬停事件")
    } catch (error) {
      console.error("触发悬停事件失败:", error)
    }

    console.log("Done!")
  },
})
