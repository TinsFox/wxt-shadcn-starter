export default defineBackground({
  async main() {
    // 创建一个每10秒触发一次的alarm
    await chrome.alarms.create("demo-default-alarm", {
      // delayInMinutes: 1 / 6, // 10秒后开始
      // periodInMinutes: 1 / 6, // 每10秒触发一次
      when: 1,
    })
    chrome.alarms.onAlarm.addListener((alarm) => {
      console.log("alarm: ", alarm)
    })
  },
})
