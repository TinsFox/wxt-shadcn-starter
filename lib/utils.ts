import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * 等待
 * @param ms
 * @returns
 */
export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTargetDates() {
  return Array.from({ length: 3 }, (_, i) => {
    return dayjs()
      .subtract(i + 1, "day")
      .format("D");
  });
}
// 显示通知的函数
export async function showNotification() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "32.png",
    title: "抖音爬虫",
    message: "即将开始抓取数据，请勿操作电脑以免中断",
    priority: 2,
  });
}
