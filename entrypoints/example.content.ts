export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...")
    await injectScript("/example-main-world.js", {
      keepInDom: true,
    })
    console.log("Done!")
  },
})
