import { wait } from "@/lib/utils.ts"

export type TaskStatus = "pending" | "running" | "completed" | "failed"

export interface Task {
  name: string
  execute: () => Promise<any>
  retries?: number
  delay?: number
}

export interface TaskResult {
  name: string
  status: TaskStatus
  error?: Error
  result?: any
}

export class TaskQueue {
  private tasks: Task[] = []
  private isRunning: boolean = false
  private maxRetries: number = 3
  private defaultDelay: number = 1000
  private results: TaskResult[] = []
  private onError?: (error: Error, taskName: string) => void
  private onSuccess?: (result: any, taskName: string) => void
  private onComplete?: (results: TaskResult[]) => void

  constructor(options?: {
    maxRetries?: number
    defaultDelay?: number
    onError?: (error: Error, taskName: string) => void
    onSuccess?: (result: any, taskName: string) => void
    onComplete?: (results: TaskResult[]) => void
  }) {
    if (options) {
      this.maxRetries = options.maxRetries ?? this.maxRetries
      this.defaultDelay = options.defaultDelay ?? this.defaultDelay
      this.onError = options.onError
      this.onSuccess = options.onSuccess
      this.onComplete = options.onComplete
    }
  }

  addTask(task: Task): TaskQueue {
    this.tasks.push({
      ...task,
      retries: task.retries ?? this.maxRetries,
      delay: task.delay ?? this.defaultDelay,
    })
    return this
  }

  async start(): Promise<TaskResult[]> {
    if (this.isRunning) {
      throw new Error("Queue is already running")
    }

    this.isRunning = true
    this.results = []

    try {
      for (const task of this.tasks) {
        const result = await this.executeTask(task)
        this.results.push(result)

        if (result.status === "failed") {
          break
        }

        await wait(task.delay!)
      }
    } finally {
      this.isRunning = false
      this.onComplete?.(this.results)
    }

    return this.results
  }

  private async executeTask(task: Task): Promise<TaskResult> {
    let attempts = 0
    const result: TaskResult = {
      name: task.name,
      status: "running",
    }

    while (attempts < task.retries!) {
      try {
        const taskResult = await task.execute()
        result.status = "completed"
        result.result = taskResult
        this.onSuccess?.(taskResult, task.name)
        return result
      } catch (error) {
        attempts++
        console.error(
          `Task "${task.name}" failed attempt ${attempts}/${task.retries}:`,
          error
        )

        if (attempts === task.retries!) {
          result.status = "failed"
          result.error = error as Error
          this.onError?.(error as Error, task.name)
          return result
        }

        await wait(task.delay!)
      }
    }

    return result
  }

  clear() {
    this.tasks = []
    this.results = []
    return this
  }

  getResults(): TaskResult[] {
    return this.results
  }
}
