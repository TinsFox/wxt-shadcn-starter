export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...")
    await injectScript("/example-main-world.js", {
      keepInDom: true,
    })

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
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "HOVER_ELEMENT") {
        hoverElement(message.data.selector)
          .then(() => sendResponse({ success: true }))
          .catch((error) =>
            sendResponse({ success: false, error: error.message })
          )
        return true // 保持消息通道开启
      }
    })

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

/**
 * 悬浮元素
 * @param selector XPath 选择器或 CSS 选择器
 * @param isXPath 是否为 XPath 选择器
 * @returns
 */
function hoverElement(selector: string, isXPath: boolean = false) {
  return new Promise((resolve, reject) => {
    try {
      // 根据选择器类型查找目标元素
      const element = isXPath
        ? document.evaluate(
            selector,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue
        : document.querySelector(selector)

      if (!element) {
        throw new Error(`Element not found: ${selector}`)
      }
      console.log("element: ", element)

      // 获取元素位置信息
      const { width, height, x, y } = (
        element as Element
      ).getBoundingClientRect()

      // 构造鼠标事件参数
      const mouseEventParams = {
        type: "mousePressed",
        x: x + width / 2,
        y: y + height / 2,
        button: "left",
        clickCount: 1,
      }

      // 发送消息给background script执行debugger命令
      chrome.runtime.sendMessage(
        {
          type: "debugger:send-command",
          method: "Input.dispatchMouseEvent",
          params: mouseEventParams,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}
/**
 * 点击实际佣金支出复选框
 */
async function findAndClickCheckbox() {
  // 定义查找复选框的函数
  const findCheckbox = () => {
    const labels = document.querySelectorAll(".ecom-checkbox-wrapper")
    return Array.from(labels)
      .find((label) => label.textContent?.trim() === "实际佣金支出")
      ?.querySelector('input[type="checkbox"]')
  }

  // 尝试查找元素，最多重试10次，每次间隔1秒
  let checkbox = null
  let attempts = 0
  const maxAttempts = 10

  while (!checkbox && attempts < maxAttempts) {
    checkbox = findCheckbox()
    if (!checkbox) {
      console.log(`第 ${attempts + 1} 次尝试未找到复选框，等待重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  // 如果找到复选框则点击
  if (checkbox) {
    await wait(1000)
    ;(checkbox as HTMLElement).click()
    console.log('已点击"实际佣金支出"复选框', checkbox)
  } else {
    console.log('在多次尝试后仍未找到"实际佣金支出"复选框')
  }
}

/**
 * 点击自然日单选按钮并选择日期
 */
async function findAndClickRadioButton() {
  // 定义查找单选按钮的函数
  const findRadio = () => {
    const labels = document.querySelectorAll(".ecom-radio-button-wrapper")
    return Array.from(labels).find(
      (label) => label.textContent?.trim() === "自然日"
    )
  }

  // 尝试查找元素，最多重试10次，每次间隔1秒
  let radioWrapper = null
  let attempts = 0
  const maxAttempts = 10

  while (!radioWrapper && attempts < maxAttempts) {
    radioWrapper = findRadio()
    if (!radioWrapper) {
      console.log(`第 ${attempts + 1} 次尝试未找到自然日单选按钮，等待重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  // 如果找到单选按钮
  if (radioWrapper) {
    console.log("radioWrapper: ", radioWrapper)
    const radio = radioWrapper.querySelector('input[type="radio"]')
    if (radio) {
      // 1. 点击单选按钮
      ;(radio as HTMLElement).click()
      console.log('已点击"自然日"单选按钮')

      // 2. 使用 hoverElement 函数触发悬停
      try {
        await hoverElement(".ecom-radio-button-wrapper")
        console.log("已触发鼠标悬浮事件")
      } catch (error) {
        console.error("触发悬停事件失败:", error)
      }
    }
  } else {
    console.log('在多次尝试后仍未找到"自然日"单选按钮')
  }
}

/**
 * 点击确定按钮
 */
async function findAndClickConfirmButton() {
  // 定义查找按钮的函数
  const findButton = () => {
    const buttons = document.querySelectorAll(".ecom-btn.ecom-btn-primary")
    return Array.from(buttons).find(
      (button) => button.textContent?.trim() === "确定"
    )
  }

  // 尝试查找元素，最多重试10次，每次间隔1秒
  let button = null
  let attempts = 0
  const maxAttempts = 10

  while (!button && attempts < maxAttempts) {
    button = findButton()
    if (!button) {
      console.log(`第 ${attempts + 1} 次尝试未找到确定按钮，等待重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  // 如果找到按钮则点击
  if (button) {
    ;(button as HTMLElement).click()
    console.log('已点击"确定"按钮', button)
  } else {
    console.log('在多次尝试后仍未找到"确定"按钮')
  }
}

/**
 * 等待
 * @param ms
 * @returns
 */
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 在日期选择器中选择指定日期
 * @param date 要选择的日期字符串
 */
async function selectDateFromCalendar(date: string) {
  // 定义查找日期单元格的函数
  const findDateCell = () => {
    const cells = document.querySelectorAll(".ecom-picker-cell-inner")
    return Array.from(cells).find((cell) => cell.textContent?.trim() === date)
  }

  // 尝试查找元素，最多重试10次，每次间隔1秒
  let dateCell = null
  let attempts = 0
  const maxAttempts = 10

  while (!dateCell && attempts < maxAttempts) {
    dateCell = findDateCell()
    if (!dateCell) {
      console.log(`第 ${attempts + 1} 次尝试未找到日期单元格，等待重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  // 如果找到日期单元格则点击
  if (dateCell) {
    ;(dateCell as HTMLElement).click()
    console.log(`已点击日期 "${date}"`, dateCell)
  } else {
    console.log(`在多次尝试后仍未找到日期 "${date}"`)
  }
}
