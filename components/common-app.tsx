import { Button } from "./ui/button"
import { sendMessage } from "@/lib/messaging"

export function CommonApp() {
  return (
    <div className="min-w-[300px] min-h-[300px] p-6 bg-white dark:bg-zinc-900">
      <div className="space-y-6">
        <div className="space-y-2">
          <div>
            <h1 className="text-xl font-medium text-zinc-900 dark:text-white">
              抖音爬虫
            </h1>
            <p>
              {import.meta.env.MODE} {buildTime}
            </p>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            抓取并分析抖音数据
          </p>
        </div>

        <div className="flex flex-col pt-2 space-y-3">
          <Button
            className="w-full text-white transition-colors bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            onClick={async () => {
              sendMessage("fetchData", undefined)
            }}
          >
            抓取数据
          </Button>
          <Button
            onClick={async () => {
              sendMessage("hover", undefined)
            }}
          >
            悬停元素
          </Button>
          <Button
            onClick={async () => {
              sendMessage("date", undefined)
            }}
          >
            选择日期
          </Button>
          <Button
            onClick={async () => {
              sendMessage("setConfig", undefined)
            }}
          >
            点击配置
          </Button>
          <Button
            onClick={async () => {
              sendMessage("money", undefined)
            }}
          >
            点击佣金
          </Button>
        </div>
        <div className="flex flex-col pt-2 space-y-3">
          <Button
            onClick={async () => {
              sendMessage("getAlarms", undefined)
            }}
          >
            获取定时器
          </Button>
        </div>
      </div>
    </div>
  )
}
