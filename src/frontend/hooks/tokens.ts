import { useMemo } from "react"
import { zeroAddress } from "viem"
import { useGlobalContext } from "../contexts"
import { BigVal, toNumber } from "@/shared/number"
import { useGetMultipleContractValues } from "./contracts"
import { ContractName, getContractInfo } from "@/shared/contracts"

export const sanitizeErc20TokenInfo = ([name, symbol, decimals, balance]: any[]) => {
  const dec = toNumber(decimals)

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: dec,
    myBalance: new BigVal(balance, 'min', { decimals: dec }).toCoinScale(),
  }
}

export const useErc20TokenInfo = (tokenContractAddress: string) => {
  const { wallet } = useGlobalContext()
  const contract = useMemo(() => getContractInfo(ContractName.Erc20, tokenContractAddress), [tokenContractAddress])

  return useGetMultipleContractValues([
    { contract, functionName: 'name' },
    { contract, functionName: 'symbol' },
    { contract, functionName: 'decimals' },
    { contract, functionName: 'balanceOf', args: [wallet?.address || zeroAddress] },
  ], {
    refetchInterval: 1000
  })
}
