import { defineExtensionMessaging } from "@webext-core/messaging";
import { defineWindowMessaging } from '@webext-core/messaging/page';

interface ProtocolMap {
  show(): void;
  fetchSpamUsers(): Record<string, number>;
  fetchModListSubscribedUsers(force?: boolean): Record<string, string>;
  hoverElement(): void;
  setConfig(): void;
  fetchData(): void;
  hover(): void;
  date(): void;
  money(): void;
  saveShopExpertData(value: any): void;
  getAlarms(alarms: any): void;
}

export const { sendMessage, onMessage, removeAllListeners } =
  defineExtensionMessaging<ProtocolMap>();
