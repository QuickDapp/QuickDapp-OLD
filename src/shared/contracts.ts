import { Abi } from 'viem'

import DiamondProxyAbi from '../../contracts/src/generated/abi.json'
import Erc20Abi from './data/erc20abi.json'
import { clientConfig } from '@/config/client'
import Multicall3 from './data/multicall3.json'

export enum ContractName {
  Erc20 = 'Erc20',
  Proxy = 'Proxy',
}

export interface ContractInfo {
  address: `0x${string}`
  abi: Abi
}

const contractAbi: Record<ContractName, Abi> = {
  [ContractName.Erc20]: Erc20Abi as Abi,
  [ContractName.Proxy]: DiamondProxyAbi as Abi,
}

const deployments: Record<string, Partial<Record<ContractName, string>>> = {
  localhost: {
    [ContractName.Proxy]: clientConfig.DIAMOND_PROXY_ADDRESS,
  },
  sepolia: {
    [ContractName.Proxy]: clientConfig.DIAMOND_PROXY_ADDRESS,
  },
}

export const getContractInfo = (contractName: ContractName, address: string): ContractInfo => {
  const abi = contractAbi[contractName]

  if (!abi) {
    throw new Error(`No abi found for ${contractName}`)
  }

  return {
    address: address as `0x${string}`,
    abi,
  }
}


export const getDeployedContractInfo = (contractName: ContractName, target: string): ContractInfo => {
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


