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
    await wait(1000)
    await findAndClickElement()
    await wait(3000)
    await findAndClickCheckbox()
    await wait(5000)
    await findAndClickConfirmButton()
    await wait(3000)
    await findAndClickRadioButton()

    console.log("Done!")
  },
})

/**
 * 点击配置列表项
 */
async function findAndClickElement() {
  // 定义查找元素的函数，使用更精确的选择器
  const findTargetElement = () => {
    // 使用类名和属性选择器
    const elements = document.querySelectorAll('.CySMU[data-btm-config="true"]')
    return Array.from(elements).find(
      (element) => element.textContent?.trim() === "配置列表项"
    )
  }

  // 尝试查找元素，最多重试10次，每次间隔1秒
  let targetElement = null
  let attempts = 0
  const maxAttempts = 10

  while (!targetElement && attempts < maxAttempts) {
    targetElement = findTargetElement()
    if (!targetElement) {
      console.log(`第 ${attempts + 1} 次尝试未找到元素，等待重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  // 如果找到元素则点击
  if (targetElement) {
    ;(targetElement as HTMLElement).click()
    console.log('已点击"配置列表项"元素', targetElement)
  } else {
    console.log('在多次尝试后仍未找到"配置列表项"元素')
  }
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
 * 点击自然日单选按钮
 */
async function findAndClickRadioButton() {
  // 定义查找单选按钮的函数
  const findRadio = () => {
    const labels = document.querySelectorAll(".ecom-radio-button-wrapper")
    return Array.from(labels)
      .find((label) => label.textContent?.trim() === "自然日")
      ?.querySelector('input[type="radio"]')
  }

  // 尝试查找元素，最多重试10次，每次间隔1秒
  let radio = null
  let attempts = 0
  const maxAttempts = 10

  while (!radio && attempts < maxAttempts) {
    radio = findRadio()
    if (!radio) {
      console.log(`第 ${attempts + 1} 次尝试未找到自然日单选按钮，等待重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }
  }

  // 如果找到单选按钮则点击
  if (radio) {
    ;(radio as HTMLElement).click()
    console.log('已点击"自然日"单选按钮', radio)
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
