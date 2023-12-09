"use client"

import { ContractValue } from "@/frontend/components/ContractValue"
import { useGetContractValue } from "@/frontend/hooks"
import { ContractName } from "@/shared/contracts"
import { toNumber } from "@/shared/number"
import { FC } from "react"
import { PropsWithClassName } from "../utils"

export const NumTokens: FC<PropsWithClassName> = ({ className }) => {
  const value = useGetContractValue({ 
    contract: ContractName.Proxy,
    functionName: 'getNumErc20s' 
  })

  return (
    <div className={className}>
      <span className="mr-2">No. of tokens:</span>
      <ContractValue value={value} sanitizeValue={toNumber}>
        {v => <span>{v}</span>}
      </ContractValue>        
    </div>
  )
}

