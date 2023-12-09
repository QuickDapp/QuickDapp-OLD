import { PropsWithClassName } from "@/frontend/utils"
import { FC } from "react"
import { Button } from "./Button"
import { Dialog, DialogContent, DialogTrigger } from "./Dialog"
import { Maximize2 } from "./Icons"

export const ErrorButton: FC<PropsWithClassName<{ label?: string, errorMessage: string }>> = ({ className, label, errorMessage }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button asChild={true} variant='error' size='xs' className={className}>
          <span>
            {label || 'Error'}<Maximize2 height='1em' width='1em' className="ml-2" />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent variant='error' size='max'>
        <pre>{errorMessage}</pre>
      </DialogContent>
    </Dialog>					
  )
}

