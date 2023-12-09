import { clientConfig } from '@/config/client'
import { ContractInfo, ContractName, getDeployedContractInfo } from '@/shared/contracts'
import { SendTransactionResult } from '@wagmi/core'
import { useCallback, useMemo } from "react"
import { paginatedIndexesConfig, useContractInfiniteReads, useContractRead, useContractReads, useContractWrite, usePublicClient } from "wagmi"
import { useGlobalContext } from "../contexts"

export interface FunctionArgs {
  contract: ContractName | ContractInfo
  functionName: string
  args?: any[]
}

const resolvedContractInfo: Record<string, ContractInfo> = {}

const getResolvedContractInfo = (contract: ContractName | ContractInfo) => {
  if (typeof contract === 'string') {
    if (!resolvedContractInfo[contract]) {
      resolvedContractInfo[contract] = getDeployedContractInfo(contract, clientConfig.CHAIN)
    }
    return resolvedContractInfo[contract]
  }
  return contract
}

export const useGetContractValue = (fa: FunctionArgs, overrides?: object) => {
  const contract = useMemo(() => getResolvedContractInfo(fa.contract), [fa.contract])

  return useContractRead({
    address: contract.address,
    abi: contract.abi,
    functionName: fa.functionName,
    args: fa.args,
    watch: true,
    ...overrides,
  })
}

export const useGetMultipleContractValues = (faList: FunctionArgs[], overrides?: any) => {
  const v = useContractReads({
    contracts: faList.map(fa => {
      const contract = getResolvedContractInfo(fa.contract)

      return {
        address: contract.address,
        abi: contract.abi,
        functionName: fa.functionName,
        args: fa.args,
      }
    }),
    watch: true,
    ...overrides,
  })

  return v
}

export type GetFunctionArgsForPageIndex = (index: number) => FunctionArgs[]

export const useGetContractPaginatedValues = ({ 
  getFaList, cacheKey, startIndex = 0, perPage = 10, direction = 'increment'
}: {
  getFaList: GetFunctionArgsForPageIndex,
  cacheKey: string,
  startIndex?: number,
  perPage?: number,
  direction?: 'increment' | 'decrement',
}, overrides?: object) => {
  return useContractInfiniteReads({
    cacheKey,
    ...paginatedIndexesConfig(
      index => {
        return getFaList(index as number).map(fa => {
          const contract = getResolvedContractInfo(fa.contract)

          return {
            address: contract.address,
            abi: contract.abi,
            functionName: fa.functionName,
            args: fa.args,
            watch: true,
          }
        })
      },
      { start: startIndex, perPage: perPage, direction }
    ),
    watch: true,
    ...overrides,
  })
}

export type ExecArgs = { 
  args: any[]
  value?: string 
  meta?: object
  notifyMsg?: string
}

export interface ChainSetterFunction {
  data?: SendTransactionResult
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
  error: Error | null
  reset: () => void
  exec: (e: ExecArgs) => Promise<any>
  canExec: boolean
}

export const useSetContractValue = ({ 
  functionName,
  contract, 
}: { 
  functionName: string, 
  contract: ContractName | ContractInfo,
}, overrides?: object): ChainSetterFunction => {
  const { chain } = useGlobalContext()
  const publicClient = usePublicClient()

  const chainId = useMemo(() => chain?.id, [chain?.id])

  const resolvedContract = useMemo(() => getResolvedContractInfo(contract), [contract])

  const props = useContractWrite({
    ...resolvedContract,
    functionName,
    chainId,
    ...overrides,
  })

  const exec = useCallback(
    async (e: ExecArgs) => {
      if (!chainId) {
        throw new Error('No chain selected')
      }

      const { args, value } = e

      const { hash } = await props.writeAsync({
        args,
        ...(value ? { value: BigInt(value) } : {}),
      })

      console.log(`Awaiting transaction confirmation for ${hash}`)

      const rec = await publicClient.waitForTransactionReceipt({ hash })

      console.log(`Transaction confirmed in block ${rec.blockNumber}`)

      return rec
    },
    [chainId, props, publicClient]
  )

  return {
    ...props,
    exec,
    canExec: !!chainId,
  }
}