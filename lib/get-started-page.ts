export async function getStartedPage() {
  if (import.meta.env.PROD) {
    browser.runtime.onInstalled.addListener(async ({ reason }) => {
      if (reason !== "install") return
      // Open a tab on install
      await browser.tabs.create({
        url: browser.runtime.getURL("/get-started.html"),
        active: true,
      })
    })
  }
}
