import { useCallback, useMemo } from "react"
import { useGlobalContext } from "../contexts"
import { clientConfig } from '@/config/client'
import { ContractInfo, ContractName, getDeployedContractInfo } from '@/shared/contracts'
import { useInfiniteReadContracts, useReadContract, useReadContracts, useWriteContract, usePublicClient } from 'wagmi'

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

export const useGetContractValue = (fa: FunctionArgs, queryOverrides?: object) => {
  const contract = useMemo(() => getResolvedContractInfo(fa.contract), [fa.contract])

  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: fa.functionName,
    args: fa.args,
    query: queryOverrides,
  })
}

export const useGetMultipleContractValues = (faList: FunctionArgs[], queryOverrides?: object) => {
  const v = useReadContracts({
    contracts: faList.map(fa => {
      const contract = getResolvedContractInfo(fa.contract)

      return {
        address: contract.address,
        abi: contract.abi,
        functionName: fa.functionName,
        args: fa.args,
      }
    }),
    query: queryOverrides,
  })

  return v
}

export type GetFunctionArgsForPageIndex = (index: number) => FunctionArgs[]

export const useGetContractPaginatedValues = (
  {
    getFaList,
    cacheKey,
    startIndex = 0,
    perPage = 10,
  }: {
    getFaList: GetFunctionArgsForPageIndex
    cacheKey: string
    startIndex?: number
    perPage?: number,
  },
  queryOverrides?: object,
) => {
  return useInfiniteReadContracts({
    cacheKey,
    contracts(pageParam) {
      const faList: any = []
      ;[...new Array(perPage)].forEach((_, i) => {
        const _list = getFaList(pageParam + i).map(fa => {
          const contract = getResolvedContractInfo(fa.contract)

          return {
            address: contract.address,
            abi: contract.abi,
            functionName: fa.functionName,
            args: fa.args,
            watch: true,
          }
        })

        faList.push(..._list)
      })

      return faList
    },
    query: {
      initialPageParam: startIndex,
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
        return lastPageParam + perPage
      },
      ...queryOverrides,
    },
  })
}

export type ExecArgs = { 
  args: any[]
  value?: string 
  meta?: object
  notifyMsg?: string
}

export interface ChainSetterFunction {
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
  const props = useWriteContract()

  const { chain } = useGlobalContext()
  const publicClient = usePublicClient()!
  const chainId = useMemo(() => chain?.id, [chain?.id])

  const resolvedContract = useMemo(() => getResolvedContractInfo(contract), [contract])

  const exec = useCallback(
    async (e: ExecArgs) => {
      if (!chainId) {
        throw new Error('No chain selected')
      }

      const { args, value } = e

      const hash = await props.writeContractAsync({
        ...resolvedContract,
        functionName,
        chainId,
        ...overrides,
        args,
        ...(value ? { value: BigInt(value) } : {}),
      })

      console.log(`Awaiting transaction confirmation for ${hash}`)

      const rec = await publicClient.waitForTransactionReceipt({ hash })

      console.log(`Transaction confirmed in block ${rec.blockNumber}`)

      return rec
    },
    [chainId, functionName, overrides, props, publicClient, resolvedContract]
  )

  return {
    ...props,
    exec,
    canExec: !!chainId,
  }
}