"use client"

import { ContractValue } from "@/frontend/components/ContractValue"
import { GetFunctionArgsForPageIndex, sanitizeErc20TokenInfo, useErc20TokenInfo, useGetContractPaginatedValues, useGetContractValue } from "@/frontend/hooks"
import { ContractName } from "@/shared/contracts"
import { toNumber } from "@/shared/number"
import { FC, ReactNode, useCallback, useEffect, useMemo } from "react"
import { zeroAddress } from "viem"
import { PropsWithClassName, cn } from "../../utils"
import { OnceVisibleInViewport } from "../OnceVisibleInViewport"
import { SendTokenDialog } from "./SendTokenDialog"
import styles from './TokenList.module.css'

const Token: FC<{ num: number, address: string }> = ({ address }) => {
  const value = useErc20TokenInfo(address)

  return (
    <ContractValue value={value} sanitizeValue={sanitizeErc20TokenInfo} className="flex flex-row justify-start items-center">
      {({ name, symbol, decimals, myBalance }) => (
        <SendTokenDialog address={address}>
          <div className={cn(
            "p-4 rounded-md m-2 bg-slate-800 ",
            "hover:bg-slate-600 hover:cursor-pointer"
          )}>
            <div className="text-sm font-mono mb-2">{address}</div>
            <div className={cn(styles.tokenMeta, "flex flex-row justify-between items-end w-full")}>
              <div className="text-left">
                <p><em>name:</em>{name}</p>
                <p><em>symbol:</em>{symbol}</p>
                <p><em>decimals:</em>{decimals}</p>
              </div>
              <div className="text-right">
                <em>bal:</em><span className="text-lg font-mono">{myBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </SendTokenDialog>
      )}
    </ContractValue>
  )
}



const List: FC<{ numTokens: number, tokens: any }> = ({ numTokens, tokens }) => {
  const items = useMemo(() => {
    const { pages } = tokens

    let tokenId = 1
    let ret: ReactNode[] = []

    for (let i = 0; i < pages.length && ret.length < numTokens; i++) {
      for (let j = 0; j < pages[i].length && ret.length < numTokens; j++) {
        if (pages[i][j].result !== zeroAddress) {
          ret.push(<li key={tokenId++}><Token num={ret.length} address={pages[i][j].result} /></li>)
        }
      }
    }

    return ret
  }, [numTokens, tokens])

  return <ul className="flex flex-row flex-wrap justify-start items-start">{items}</ul>
}


const getFaListForTokens: GetFunctionArgsForPageIndex = (index: number) => {
  return [
    {
      contract: ContractName.Proxy,
      functionName: 'getErc20Address',
      args: [index],
    },
  ]
}

export const TokenList: FC<PropsWithClassName> = ({ className }) => {
  const numTokens = useGetContractValue({
    contract: ContractName.Proxy,
    functionName: 'getNumErc20s'
  }, {
    refetchInterval: 1000
  })

  const tokens = useGetContractPaginatedValues({
    cacheKey: 'tokens',
    getFaList: getFaListForTokens,
    startIndex: 1,
    perPage: 10,
  }, {
    refetchInterval: 1000,
  })

  useEffect(() => {
    tokens.refetch()
  }, [numTokens.data, tokens])

  const onReachedBottomOfView = useCallback((inView: boolean) => {
    if (inView) {
      tokens.fetchNextPage()
    }
  }, [tokens])

  return (
    <div className={className}>
      <ContractValue value={numTokens} sanitizeValue={toNumber}>
        {numTokensValue => (
          <ContractValue value={tokens}>
            {tokensValue => <List numTokens={numTokensValue} tokens={tokensValue} />}
          </ContractValue>        
        )}
      </ContractValue>
      <OnceVisibleInViewport onVisibilityChanged={onReachedBottomOfView} />
    </div>
  )
}

