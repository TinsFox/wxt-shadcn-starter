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
