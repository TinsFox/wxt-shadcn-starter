async function createAlarm(name: string, delay: number) {
  await chrome.alarms.create(name, { delayInMinutes: delay })
}
async function initAlarm() {
  await chrome.alarms.create("demo-default-alarm", {
    // delayInMinutes: 1 / 6, // 10秒后开始
    // periodInMinutes: 1 / 6, // 每10秒触发一次
    when: 1,
  })
  chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("alarm: ", alarm)
  })
}

export { createAlarm, initAlarm }
