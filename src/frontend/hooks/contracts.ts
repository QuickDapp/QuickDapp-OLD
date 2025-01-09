import { clientConfig } from '@/config/client'
import { ContractInfo, ContractName, getDeployedContractInfo, getMulticall3Info } from '@/shared/contracts'
import { useCallback, useMemo, useState } from "react"
import { Abi, WalletClient } from "viem"
import { useInfiniteReadContracts, usePublicClient, useReadContract, useReadContracts, useWalletClient } from 'wagmi'
import { useGlobalContext } from "../contexts"
import { useToast } from './toast'

export interface FunctionArgs {
  contract: ContractName | ContractInfo
  functionName: string
  args?: any[]
}

const resolvedContractInfo: Record<string, ContractInfo> = {}

const getResolvedContractInfo = (contract: ContractName | ContractInfo) => {
  if (typeof contract === 'string') {
    if (!resolvedContractInfo[contract]) {
      resolvedContractInfo[contract] = getDeployedContractInfo(contract, clientConfig.NEXT_PUBLIC_CHAIN)
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
    functionName: fa.functionName as any,
    args: fa.args as any,
    query: queryOverrides,
  })
}

export const useGetMultipleContractValues = (faList: FunctionArgs[], queryOverrides?: object) => {
  const multicall3 = useMemo(() => getMulticall3Info(), [])

  const v = useReadContracts({
    contracts: faList.map(fa => {
      const contract = getResolvedContractInfo(fa.contract)

      return {
        address: contract.address,
        abi: contract.abi as Abi,
        functionName: fa.functionName as any,
        args: fa.args as any,
      }
    }),
    multicallAddress: multicall3.contract,
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
            functionName: fa.functionName as any,
            args: fa.args as any,
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
  successToastMsg?: string
  hideSuccessToast?: boolean
  hideErrorToast?: boolean
}

export interface ChainSetterFunction {
  isLoading?: boolean
  isSuccess?: boolean
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
  const { wallet } = useGlobalContext()
  const publicClient = usePublicClient()!
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const chainId = useMemo(() => chain?.id, [chain?.id])
  const canExec = useMemo(() => !!chainId, [chainId])
  const { toast } = useToast()

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsSuccess(false)
    setError(null)
  }, [])

  const resolvedContract = useMemo(() => getResolvedContractInfo(contract), [contract])

  const exec = useCallback(
    async (execArgs: ExecArgs) => {
      let preparedRequest: any
      try {
        setIsLoading(true)
        setIsSuccess(false)
        setError(null)

        if (!canExec) {
          throw new Error('No chain selected')
        }
  
        const { args, value } = execArgs

        preparedRequest = await publicClient.simulateContract({
          ...resolvedContract,
          account: wallet!.client.account,
          functionName: functionName as any,
          args: args as any,
          ...(value ? { value: BigInt(value) as any } : {}),
        }) 
      } catch (e) {
        setError(e as Error)

        if (!execArgs.hideErrorToast) {
          toast({
            title: 'Transaction simulation failed',
            variant: 'destructive',
          })  
        }

        throw e
      }

      try {
        const hash = await wallet!.client.writeContract(preparedRequest.request)
  
        console.log(`Awaiting transaction confirmation for ${hash}`)
  
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed')
        }
  
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
        console.log(receipt)
  
        setIsSuccess(true)

        if (!execArgs.hideSuccessToast) {
          toast({
            title: execArgs.successToastMsg || 'Transaction confirmed',
          })
        }

        return receipt
      } catch (e) {
        setError(e as Error)
        if (!execArgs.hideErrorToast) {
          toast({
            title: 'Transaction failed',
            variant: 'destructive',
          })  
        }
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [chainId, functionName, overrides, publicClient, resolvedContract]
  )

  return {
    exec,
    reset,
    isLoading,
    isSuccess,
    error,
    canExec: !!chainId,
  }
}