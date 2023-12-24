import { getUser } from '@/backend/db'
import { ChainFilterModule } from '../types'
import { serverConfig } from '@/config/server'
import { ContractName, getContractInfo, getDeployedContractInfo, getMulticall3Info } from '@/shared/contracts'

const proxyContract = getDeployedContractInfo(ContractName.Proxy, serverConfig.CHAIN)
const { contract: multicallAddress } = getMulticall3Info()

export const createFilter: ChainFilterModule['createFilter'] = (chainClient) => {
  return chainClient.createContractEventFilter({
    ...proxyContract,
    eventName: 'ERC20NewToken',
  })
}

export const processChanges: ChainFilterModule['processChanges'] = async (app, changes) => {
  const { db, chainClient, log } = app

  await Promise.all(
    changes.map(async (change: any) => {
      try {
        const {
          transactionHash: hash,
          args: { token },
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

        const user = (await getUser(db, transaction.from))!

        const tokenStr = `${symbol.result} (${name.result})`
        
        log.info(`Writing notification for user ${user.id} for new token ${tokenStr}`)

        await app.notifyUser(user, {
          msg: `Created new token ${tokenStr}`,
        })

        await app.mailer?.send({
          to: serverConfig.MAILGUN_FROM_ADDRESS!,
          subject: `New Token Created: ${tokenStr}`,
          text: `You created a new token: ${tokenStr}`,
        })
      } catch (err) {
        log.error(`Error processing event`, err)
        throw err
      }
    })
  )
}

