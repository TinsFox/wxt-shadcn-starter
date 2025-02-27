import {
  hoverElement,
  calendarXPath,
  findAndClickConfigElement,
  selectCommissionCheckbox,
  clickConfirmButton,
} from "@/lib/element.ts"
import { initBackgroundScript } from "@/lib/handle-background-script"
import { getTargetDates, wait } from "@/lib/utils.ts"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { onMessage } from "@/lib/messaging.ts"
import { fetchData } from "@/lib/task.ts"

export default defineContentScript({
  matches: [
    "https://compass.jinritemai.com/*",
    "https://www.compass.jinritemai.com/*",
  ],
  runAt: "document_end",
  async main() {
    await injectScript("/inject.js", {
      keepInDom: true,
    })

    initBackgroundScript()
    // 等待页面加载完成
    if (document.readyState !== "complete") {
      await new Promise((resolve) => window.addEventListener("load", resolve))
    }
    onMessage("setConfig", async (message) => {
      await findAndClickConfigElement()
    })
    onMessage("fetchData", async () => {
      await fetchData()
    })
    onMessage("money", async () => {
      await selectCommissionCheckbox()
      await wait(3000)
      await clickConfirmButton()
    })
    onMessage("hover", async () => {
      await hoverElement(calendarXPath, 3000, true)
    })
    onMessage("date", async () => {
      const dates = getTargetDates()
      for (const date of dates) {
        await hoverElement(calendarXPath, 3000, true)
        const findDateCell = () => {
          const cells = document.querySelectorAll(".ecom-picker-cell-inner")
          return Array.from(cells).find(
            (cell) => cell.textContent?.trim() === date
          )
        }
        const dateCell = findDateCell()

        if (dateCell) {
          ;(dateCell as HTMLElement).click()
          // 使用明确的 Promise 来确保等待
          await new Promise((resolve) => setTimeout(resolve, 10000))
        } else {
        }
      }
    })

    // const ui = createIntegratedUi(ctx, {
    //   tag: "wxt-react-example",
    //   position: "inline",
    //   append: "first",
    //   onMount: (container) => {
    //     // Don't mount react app directly on <body>
    //     const wrapper = document.createElement("div")
    //     wrapper.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    //     container.append(wrapper)

    //     const root = ReactDOM.createRoot(wrapper)
    //     root.render(<App />)
    //     return { root, wrapper }
    //   },
    //   onRemove: (elements) => {
    //     elements?.root.unmount()
    //     elements?.wrapper.remove()
    //   },
    // })

    // ui.mount()
  },
})
