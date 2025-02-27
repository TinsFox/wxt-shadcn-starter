import {
  findAndClickConfigElement,
  selectCommissionCheckbox,
  clickConfirmButton,
  selectDateFromCalendar,
  autoClickNextPage,
} from "./element";
import { TaskQueue } from "./queue";
import { wait, getTargetDates, showNotification } from "./utils";

export async function fetchData() {
  await showNotification();
  chrome.tabs.create({
    url: "https://compass.jinritemai.com/shop/talent-list",
    active: true, // 是否立即切换到新标签页
    pinned: false, // 是否固定标签页
    index: 0, // 新标签页的位置（0表示最左边）
  });
  // 初始配置任务
  const queue = new TaskQueue({
    maxRetries: 3,
    defaultDelay: 3000,
    onError: (error, taskName) => {
      console.error(`Error in task ${taskName}:`, error);
    },
    onSuccess: (_, taskName) => {
      console.log(`Task ${taskName} completed successfully`);
    },
    onComplete: (results) => {
      console.log("All tasks completed successfully");
    },
  });

  queue
    .addTask({
      name: "Initial wait",
      execute: () => wait(3000),
    })
    .addTask({
      name: "Click config element",
      execute: () => findAndClickConfigElement(),
    })
    .addTask({
      name: "Click checkbox",
      execute: () => selectCommissionCheckbox(),
    })
    .addTask({
      name: "Click confirm button",
      execute: () => clickConfirmButton(),
    });

  // 获取前三天的日期
  const dates = getTargetDates();

  // 添加每天的数据处理任务
  for (const date of dates) {
    queue
      .addTask({
        name: `Select date ${date}`,
        execute: () => selectDateFromCalendar(date),
      })
      .addTask({
        name: `Process pages for date ${date}`,
        execute: () => autoClickNextPage(),
        delay: 60000, // 等待一分钟再处理下一天
      });
  }

  try {
    const results = await queue.start();
  } catch (error) {}
}
