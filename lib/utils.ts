import { clsx, type ClassValue } from "clsx";
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
  return new Promise((resolve) => setTimeout(resolve, ms))
}