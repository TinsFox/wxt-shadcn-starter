import { defineProxyService } from "@webext-core/proxy-service";
import { defineJobScheduler } from "@webext-core/job-scheduler";

export const [registerJobScheduler, getJobScheduler] = defineProxyService(
  "JobScheduler",
  () => defineJobScheduler(),
);
