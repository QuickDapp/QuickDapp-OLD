import { PropsWithClassName, cn } from "@/frontend/utils"
import { FC, ReactNode, useMemo } from "react"
import { ClientOnly } from "./ClientOnly"
import { ErrorButton } from "./ErrorButton"
import { Loading } from "./Loading"

export interface Props {
  value: {
    data: any
    error: any
    isLoading: boolean
  }, 
  sanitizeValue?: (v: any) => any,
  children: (v: any) => ReactNode, 
}

const ContractValueComponent: FC<PropsWithClassName<Props>> = ({ className, children, value, sanitizeValue }) => {
  const content = useMemo(() => {
    // check if the result of a multical
    if (Array.isArray(value.data)) {
      const multiErrors: any[] = []
      const multiResults: any[] = []

      value.data.forEach((v) => {
        if (v.error) {
          multiErrors.push(v.error)
        } else if (typeof v.result !== 'undefined') {
          multiResults.push(v.result)
        }
      })

      if (multiErrors.length) {
        const errStr = multiErrors.map((e) => String(e)).join("\n")
        return <ErrorButton errorMessage={errStr} />
      } else if (multiResults.length) {
        const v2 = sanitizeValue ? sanitizeValue(multiResults) : multiResults
        return children(v2)
      } else {
        return <Loading className="inline-block" />
      }
    } else {
      if (value.error) {
        return <ErrorButton errorMessage={String(value.error)} />
      } else if (typeof value.data !== 'undefined') {
        const v = sanitizeValue ? sanitizeValue(value.data) : value.data
        return children(v)
      } else {
        return <Loading className="inline-block" />
      }
    }
  }, [value, sanitizeValue, children])

  return (
    <div className={cn('inline-block', className)}>{content}</div>
  )
}


export const ContractValue: FC<PropsWithClassName<Props>> = (props) => {
  return (
    <ClientOnly>
      <ContractValueComponent {...props} />
    </ClientOnly>
  )
}

