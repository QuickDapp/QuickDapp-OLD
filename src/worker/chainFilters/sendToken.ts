import { getUser } from '@/backend/db'
import { serverConfig } from '@/config/server'
import { ContractName, getContractInfo, getDeployedContractInfo, getMulticall3Info } from '@/shared/contracts'
import { weiToEth } from '@/shared/number'
import { ChainFilterModule } from '../types'

const proxyContract = getDeployedContractInfo(ContractName.DiamondProxy, serverConfig.NEXT_PUBLIC_CHAIN)
const { contract: multicallAddress } = getMulticall3Info()

export const createFilter: ChainFilterModule['createFilter'] = (chainClient) => {
  return chainClient.createContractEventFilter({
    ...proxyContract,
    eventName: 'ERC20Transferred',
  })
}

export const processChanges: ChainFilterModule['processChanges'] = async (app, changes) => {
  const { chainClient, log } = app

  await Promise.all(
    changes.map(async (change: any) => {
      try {
        const {
          transactionHash: hash,
          args: { token, to, value },
        } = change

        const transaction = await chainClient.getTransactionReceipt({ hash })

        const contractInfo = getContractInfo(ContractName.Erc20, token)

        const [name, symbol] = await chainClient.multicall({
          contracts: [
            {
              ...contractInfo,
              functionName: 'name',
          },
            {
              ...contractInfo,
              functionName: 'symbol',
            },
          ],
          multicallAddress,
        })

        const user = (await getUser(app, transaction.from))!

        const tokenStr = `${symbol.result} (${name.result})`

        const amount = weiToEth(value).toFixed(2)

        log.info(`Writing notification for user ${user.id} for token transfer of ${tokenStr}`)

        await app.notifyUser(user, {
          msg: `Sent ${amount} ${tokenStr} to ${to}`,
        })
      } catch (err) {
        log.error(`Error processing event`, err)
        throw err
      }
    })
  )
}

