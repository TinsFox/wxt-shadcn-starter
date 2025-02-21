// 等待元素出现后再点击
export async function waitAndClick(selector: string) {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(checkInterval);
        (element as HTMLElement).click();
        resolve(true);
      }
    }, 100);
  });
}
export function simulateClick(element: HTMLElement) {
  // 模拟鼠标移动到元素上
  const mouseoverEvent = new MouseEvent('mouseover', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(mouseoverEvent);

  // 模拟鼠标按下
  const mousedownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(mousedownEvent);

  // 模拟鼠标松开
  const mouseupEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(mouseupEvent);

  // 模拟点击
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(clickEvent);
}
export function findElementByText(text: string, options = {}) {
  const defaultOptions = {
    exact: false,  // 是否精确匹配
    timeout: 10000,  // 超时时间
    interval: 100,  // 检查间隔
    visible: true,  // 是否只匹配可见元素
    caseSensitive: false  // 是否区分大小写
  };

  const opts = { ...defaultOptions, ...options };

  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkElement = () => {
      // 获取所有元素
      const elements = Array.from(document.getElementsByTagName('*'));

      // 查找匹配的元素
      const element = elements.find(el => {
        // 检查元素是否可见
        if (opts.visible && el.offsetParent === null) {
          return false;
        }

        let elementText = el.textContent.trim();
        let searchText = text.trim();

        // 处理大小写
        if (!opts.caseSensitive) {
          elementText = elementText.toLowerCase();
          searchText = searchText.toLowerCase();
        }

        // 根据匹配模式返回结果
        return opts.exact ? elementText === searchText : elementText.includes(searchText);
      });

      if (element) {
        clearInterval(intervalId);
        resolve(element);
        return true;
      }

      // 检查是否超时
      if (Date.now() - startTime > opts.timeout) {
        clearInterval(intervalId);
        resolve(null);
        return false;
      }

      return false;
    };

    const intervalId = setInterval(checkElement, opts.interval);
    checkElement(); // 立即执行一次检查
  });
}
// 定义配置接口
interface ElementFinderOptions {
  maxRetries: number;
  retryInterval: number;
  timeout: number;
  debug?: boolean;
}

// 定义查找选项接口
interface FindElementOptions {
  exact?: boolean;
  visible?: boolean;
  caseSensitive?: boolean;
}

export class ElementFinder {
  private options: ElementFinderOptions;
  private logger: Logger;

  constructor(options: Partial<ElementFinderOptions> = {}) {
    this.options = {
      maxRetries: 3,
      retryInterval: 1000,
      timeout: 10000,
      debug: true,
      ...options
    };
    this.logger = new Logger(this.options.debug);
  }

  /**
   * 查找并点击包含指定文本的元素
   * @param text 要查找的文本
   * @param findOptions 查找选项
   */
  public async findAndClickByText(
    text: string,
    findOptions: FindElementOptions = {}
  ): Promise<boolean> {
    let retries = 0;
    this.logger.info(`开始查找文本："${text}"`);

    while (retries < this.options.maxRetries) {
      try {
        this.logger.info(`尝试第 ${retries + 1} 次查找...`);

        const element = await this.findElement(text, findOptions);
        if (element) {

          this.logger.info('找到匹配元素，准备点击', element);
          await this.clickElement(element);
          this.logger.success('成功点击元素');
          return true;
        }

        this.logger.warn(`第 ${retries + 1} 次查找未找到元素`);
        retries++;

        if (retries < this.options.maxRetries) {
          this.logger.info(`等待 ${this.options.retryInterval}ms 后重试...`);
          await this.delay(this.options.retryInterval);
        }
      } catch (error) {
        this.logger.error(`第 ${retries + 1} 次尝试失败:`, error);
        retries++;

        if (retries < this.options.maxRetries) {
          await this.delay(this.options.retryInterval);
        }
      }
    }

    const errorMsg = `在 ${this.options.maxRetries} 次尝试后未能找到或点击元素`;
    this.logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * 查找元素
   */
  private async findElement(
    text: string,
    options: FindElementOptions
  ): Promise<Element | null> {
    const startTime = Date.now();
    this.logger.info('开始查找元素...');

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const elements = Array.from(document.getElementsByTagName('*'));
        const element = elements.find(el => {
          if (options.visible && !this.isElementVisible(el)) {
            return false;
          }

          let elementText = el.textContent?.trim() || '';
          let searchText = text.trim();

          if (!options.caseSensitive) {
            elementText = elementText.toLowerCase();
            searchText = searchText.toLowerCase();
          }

          return options.exact
            ? elementText === searchText
            : elementText.includes(searchText);
        });

        if (element) {
          clearInterval(checkInterval);
          this.logger.success('找到匹配元素');
          resolve(element);
        } else if (Date.now() - startTime > this.options.timeout) {
          clearInterval(checkInterval);
          this.logger.warn('查找超时');
          resolve(null);
        }
      }, 100);
    });
  }

  /**
   * 点击元素
   */
  private async clickElement(element: Element): Promise<void> {
    this.logger.info('准备点击元素...');

    // 滚动到元素位置
    this.logger.info('滚动到元素位置');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 等待滚动完成
    await this.delay(100);

    try {
      this.logger.info('尝试直接点击');
      (element as HTMLElement).click();
    } catch (error) {
      this.logger.warn('直接点击失败，尝试使用事件模拟点击');

      // 如果普通点击失败，尝试使用事件
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(clickEvent);
    }
  }

  /**
   * 检查元素是否可见
   */
  private isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element as HTMLElement);
    return !!(element.getClientRects().length &&
      style.getPropertyValue('visibility') !== 'hidden' &&
      style.getPropertyValue('display') !== 'none');
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
* 日志类
*/
class Logger {
  private readonly debug: boolean;
  private readonly styles = {
    info: 'color: #2196F3',
    success: 'color: #4CAF50',
    warn: 'color: #FFC107',
    error: 'color: #F44336'
  };

  constructor(debug: boolean = true) {
    this.debug = debug;
  }

  public info(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`%c[INFO] ${message}`, this.styles.info, ...args);
    }
  }

  public success(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`%c[SUCCESS] ${message}`, this.styles.success, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.debug) {
      console.warn(`%c[WARN] ${message}`, this.styles.warn, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.debug) {
      console.error(`%c[ERROR] ${message}`, this.styles.error, ...args);
    }
  }
}


