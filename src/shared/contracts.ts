import { clientConfig } from '@/config/client'
import { baseSepolia } from 'viem/chains'
import { ContractName, getContractAbi } from './abi/generated'
import Multicall3 from './data/multicall3.json'

export { ContractName }

const deployments: Record<string, Partial<Record<ContractName, string>>> = {
  localhost: {
    [ContractName.DiamondProxy]: clientConfig.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS,
  },
  sepolia: {
    [ContractName.DiamondProxy]: clientConfig.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS,
  },
  baseSepolia: {
    [ContractName.DiamondProxy]: clientConfig.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS,
  },
}

export const getContractInfo = (contractName: ContractName, address: string) => {
  const abi = getContractAbi(contractName)

  return {
    address: address as `0x${string}`,
    abi,
  } as const
}

export type ContractInfo = ReturnType<typeof getContractInfo>

export const getDeployedContractInfo = (contractName: ContractName, target: string) => {
  if (!deployments[target]) {
    throw new Error(`No deployment target found for ${target}`)
  }

  const contractAddress = deployments[target][contractName]

  if (!contractAddress) {
    throw new Error(`No deployment found for ${contractName} in target ${target}`)
  }

  return getContractInfo(contractName, contractAddress)
}



export const getMulticall3Info = () => {
  return {
    contract: Multicall3.contract as `0x${string}`,
    sender: Multicall3.sender as `0x${string}`,
    eth: Multicall3.eth as string,
    signedDeploymentTx: Multicall3.signedDeploymentTx as `0x${string}`,
  }
}


