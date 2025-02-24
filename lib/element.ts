import { wait } from "@/lib/utils.ts"

/**
 * 通用的重试查找元素函数
 * @param findFn 查找元素的函数
 * @param elementDescription 元素描述（用于日志）
 * @param maxAttempts 最大重试次数
 * @param interval 重试间隔(ms)
 * @returns 找到的元素或null
 */
async function retryFindElement<T>(
  findFn: () => T | null | undefined,
  elementDescription: string,
  maxAttempts: number = 10,
  interval: number = 1000
): Promise<T> {
  let attempts = 0
  let element = null

  while (!element && attempts < maxAttempts) {
    element = findFn()
    if (!element) {
      console.log(
        `第 ${attempts + 1} 次尝试未找到${elementDescription}，等待重试...`
      )
      await wait(interval)
      attempts++
    }
  }

  if (!element) {
    throw new Error(`在${maxAttempts}次尝试后仍未找到${elementDescription}`)
  }

  return element as T
}

/**
 * 点击配置列表项
 */
export async function findAndClickConfigElement() {
  const findTargetElement = () => {
    const elements = document.querySelectorAll('.CySMU[data-btm-config="true"]')
    return Array.from(elements).find(
      (element) => element.textContent?.trim() === "配置列表项"
    )
  }

  const targetElement = await retryFindElement(findTargetElement, "配置列表项")
  ;(targetElement as HTMLElement).click()
  console.log('已点击"配置列表项"元素', targetElement)
}

/**
 * 发送 debugger 命令到 background script
 * @param method debugger 方法名
 * @param params 方法参数
 * @returns Promise
 */
function sendDebuggerCommand(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "debugger:send-command",
        method,
        params,
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
  })
}

/**
 * 悬浮元素
 * @param selector XPath 选择器或 CSS 选择器
 * @param isXPath 是否为 XPath 选择器
 * @returns
 */
export function hoverElement(selector: string, isXPath: boolean = false) {
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

      // 使用新的 sendDebuggerCommand 方法
      sendDebuggerCommand("Input.dispatchMouseEvent", mouseEventParams)
        .then(resolve)
        .catch(reject)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 点击实际佣金支出复选框
 */
export async function findAndClickCheckbox() {
  const findCheckbox = () => {
    const labels = document.querySelectorAll(".ecom-checkbox-wrapper")
    return Array.from(labels)
      .find((label) => label.textContent?.trim() === "实际佣金支出")
      ?.querySelector('input[type="checkbox"]')
  }

  const checkbox = await retryFindElement(findCheckbox, "实际佣金支出复选框")
  await wait(1000)
  ;(checkbox as HTMLElement).click()
  console.log('已点击"实际佣金支出"复选框', checkbox)
}

/**
 * 点击确定按钮
 */
export async function findAndClickConfirmButton() {
  const findButton = () => {
    const buttons = document.querySelectorAll(".ecom-btn.ecom-btn-primary")
    return Array.from(buttons).find(
      (button) => button.textContent?.trim() === "确定"
    )
  }

  const button = await retryFindElement(findButton, "确定按钮")
  ;(button as HTMLElement).click()
  console.log('已点击"确定"按钮', button)
}

/**
 * 在日历上选择指定日期
 * @param date 要选择的日期字符串
 */
export async function selectDateFromCalendar(date: string) {
  // 日历元素的 XPath
  const calendarXPath =
    '//*[@id="root"]/div[1]/div/div[2]/div/div[2]/div/div/label[4]'

  try {
    // 先悬停在日历元素上
    await hoverElement(calendarXPath, true)
    console.log("成功触发日历悬停事件")

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
        await wait(1000)
        // 如果找不到日期单元格，重新悬停
        await hoverElement(calendarXPath, true)
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
  } catch (error) {
    console.error("选择日期失败:", error)
  }
}

/**
 * 点击下一页按钮（如果可点击）
 * @returns Promise<boolean> 是否成功点击
 */
export async function clickNextPageButton(): Promise<boolean> {
  const findNextButton = () => {
    const nextButton = document.querySelector(".ecom-pagination-next")
    // 如果按钮存在且不包含 disabled 类，则返回
    if (
      nextButton &&
      !nextButton.classList.contains("ecom-pagination-disabled")
    ) {
      return nextButton
    }
    return null
  }

  try {
    const nextButton = await retryFindElement(
      findNextButton,
      "可点击的下一页按钮"
    )
    ;(nextButton as HTMLElement).click()
    console.log('已点击"下一页"按钮')
    return true
  } catch (error) {
    if (error instanceof Error && error.message.includes("仍未找到")) {
      console.log("下一页按钮不可点击或未找到")
      return false
    }
    throw error // 重新抛出其他类型的错误
  }
}

/**
 * 持续检查并点击下一页按钮
 * @param interval 点击间隔(ms)，默认5000ms
 */
export async function autoClickNextPage(interval: number = 5000) {
  while (true) {
    const clicked = await clickNextPageButton()
    if (!clicked) {
      console.log("已到达最后一页或按钮不可点击，停止自动翻页")
      break
    }
    await wait(interval)
  }
}
