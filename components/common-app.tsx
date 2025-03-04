import dayjs from "dayjs"
import { Button } from "./ui/button"
import { sendMessage } from "@/lib/messaging"
import relativeTime from "dayjs/plugin/relativeTime"
import { useState, useEffect } from "react"

dayjs.extend(relativeTime)

export function CommonApp() {
  const [nextFetchTimes, setNextFetchTimes] = useState<{
    [key: string]: string
  }>({})

  useEffect(() => {
    // 获取所有定时任务的下次执行时间
    chrome.alarms.getAll((alarms) => {
      const times: { [key: string]: string } = {}
      alarms.forEach((alarm) => {
        times[alarm.name] = new Date(alarm.scheduledTime).toLocaleString()
      })
      setNextFetchTimes(times)
    })
  }, [])

  const resetAlarms = async () => {
    await chrome.alarms.clearAll()

    // 计算下一个11点和12点
    const next11AM = new Date()
    next11AM.setHours(11, 0, 0, 0)
    if (next11AM.getTime() < Date.now()) {
      next11AM.setDate(next11AM.getDate() + 1)
    }

    const next12PM = new Date()
    next12PM.setHours(12, 0, 0, 0)
    if (next12PM.getTime() < Date.now()) {
      next12PM.setDate(next12PM.getDate() + 1)
    }

    // 创建新的定时任务
    chrome.alarms.create("fetchData11AM", {
      when: next11AM.getTime(),
      periodInMinutes: 24 * 60,
    })

    chrome.alarms.create("fetchData12PM", {
      when: next12PM.getTime(),
      periodInMinutes: 24 * 60,
    })

    // 创建测试用的定时任务
    chrome.alarms.create("fetchDataTest", {
      periodInMinutes: 2,
      when: Date.now() + 1000,
    })

    // 更新显示时间
    chrome.alarms.getAll((alarms) => {
      const times: { [key: string]: string } = {}
      alarms.forEach((alarm) => {
        times[alarm.name] = new Date(alarm.scheduledTime).toLocaleString()
      })
      setNextFetchTimes(times)
    })
  }

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
            <p>{dayjs(buildTime).fromNow()}</p>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            抓取并分析抖音数据
          </p>
        </div>

        <div className="flex flex-col pt-2 space-y-3">
          <Button
            className="w-full text-white transition-colors bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            onClick={async () => {
              console.log("Sending fetchData message from popup")
              try {
                chrome.runtime.sendMessage(
                  { type: "fetchData" },
                  (response) => {
                    console.log("Popup received response:", response)
                  }
                )
              } catch (error) {
                console.error("Error sending message:", error)
              }
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
        <div className="flex flex-col pt-2 space-y-3">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            下次抓取时间:
            <div>11点: {nextFetchTimes["fetchData11AM"] || "未设置"}</div>
            <div>12点: {nextFetchTimes["fetchData12PM"] || "未设置"}</div>
            <div>
              测试(2分钟): {nextFetchTimes["fetchDataTest"] || "未设置"}
            </div>
          </div>
          <Button onClick={resetAlarms}>重置定时任务</Button>
          <Button
            onClick={async () => {
              await chrome.alarms.clearAll()
              setNextFetchTimes({})
            }}
          >
            停止定时任务
          </Button>
          <Button
            onClick={async () => {
              chrome.alarms.getAll((alarms) => {
                console.log("Current alarms:", alarms)
              })
            }}
          >
            查看所有定时任务
          </Button>
        </div>
      </div>
    </div>
  )
}
