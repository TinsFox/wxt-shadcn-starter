import {
  findAndClickConfigElement,
  selectCommissionCheckbox,
  clickConfirmButton,
  selectDateFromCalendar,
  autoClickNextPage,
} from "./element";
import { TaskQueue } from "./queue";
import { wait, getTargetDates } from "./utils";

export async function fetchData() {
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
