import "~/assets/main.css"
import { Button } from "@/components/ui/button"
import { sendMessage } from "@/lib/messaging"

export default () => {
  return (
    <div className="size-full">
      <Button onClick={() => sendMessage("setConfig", undefined)}>
        选中佣金
      </Button>
    </div>
  )
}
