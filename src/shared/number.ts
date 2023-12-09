import { BigVal } from 'bigval'

export { BigVal }

export const toNumber = (n: any): number => {
  return new BigVal(n).toNumber()
}

export const weiToEth = (wei: string | number): BigVal => {
  return new BigVal(wei, 'min').toCoinScale()
}

export const ethToWei = (eth: string | number): BigVal => {
  return new BigVal(eth, 'coins').toMinScale()
}

export const prettyifyUsd = (usd: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
}