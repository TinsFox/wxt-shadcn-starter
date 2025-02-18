import { API_URL } from "@/const"

export default defineBackground({
  main() {
    console.log("Hello background!", { id: browser.runtime.id })
  },
})
