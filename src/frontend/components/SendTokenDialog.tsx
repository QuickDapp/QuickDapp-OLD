"use client"

import { Button } from "@/frontend/components/Button"
import { FieldError, TextInput } from "@/frontend/components/Form"
import { sanitizeErc20TokenInfo, useErc20TokenInfo, useField, useForm, useSetContractValue } from "@/frontend/hooks"
import { ContractName, getContractInfo } from "@/shared/contracts"
import { BigVal } from "@/shared/number"
import { DialogTitle } from "@radix-ui/react-dialog"
import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react"
import { TransactionReceipt, isAddress } from "viem"
import { ContractValue } from "./ContractValue"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./Dialog"
import { ErrorButton } from "./ErrorButton"


const UserBalance: FC<{ userBalance: BigVal, onClick: () => void }> = ({ userBalance, onClick }) => {
  return (
    <div className="text-sm cursor-pointer" onClick={onClick}>
      <em>bal:</em>
      <span className="font-mono ml-2 text-anchor">{userBalance.toFixed(2)}</span>
    </div>
  )
}


const SendTokenForm: FC<{ 
  address: string, 
  decimals: number,
  userBalance: BigVal,
  onSent: () => void 
}> = ({ address, onSent, userBalance }) => {
  const contract = useMemo(() => getContractInfo(ContractName.Erc20, address), [address])

  const decimals = useMemo(() => {
    return userBalance ? userBalance.config.decimals! : 0
  }, [userBalance])

  const [recipient, amount] = [
    useField({
      name: 'recipient',
      initialValue: '',
      validate: validations.recipient.validate,
    }),
    useField({
      name: 'amount',
      initialValue: '',
      validateAsync: async (a: string) => {
        try {
          const n = new BigVal(a.trim(), 'coins', { decimals })

          if (n.decimalCount > decimals) {
            return `Must be a number with at most ${decimals} decimals`
          } else if (userBalance) {
            if (userBalance.lt(a)) {
              return 'Insufficient balance'
            }
          } else {
            return 'Waiting for token balance info to compare against.'
          }
        } catch (err) {
          return 'Must be a number'
        }
      }
    }),
  ]

  const {
    valid,
    formError,
  } = useForm({
    fields: [recipient, amount],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const send = useSetContractValue({ functionName: 'transfer', contract })

  const canSubmit = useMemo(() => {
    return valid && !isSubmitting && send.canExec
  }, [valid, isSubmitting, send.canExec])

  const onSubmit = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    send.reset()

    setIsSubmitting(true)

    try {
      await send.exec({
        args: [
          recipient.value, 
          new BigVal(amount.value, 'coins', { decimals }).toMinScale().toString()
        ]
      }) as TransactionReceipt

      onSent()
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }, [send, recipient.value, amount.value, decimals, onSent])

  const onUseMaxBalance = useCallback(() => {
    amount.handleChange(userBalance.toFixed(decimals))
  }, [amount, decimals, userBalance])

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className='mt-4 max-w-xs'>
          <TextInput
            field={recipient}
            label="To"
            help="Wallet to send tokens to"
            className="w-96"
            maxChars={42}
            showCharCount={true}
            required={true}
            placeholder="0x..."
          />
        </div>
        <div className='mt-4 max-w-xs'>
          <TextInput
            field={amount}
            label="Amount"
            help="Amount to send"
            className="w-80"
            maxChars={decimals + 4}
            required={true}
            placeholder="Amount..."
            labelRight={
              <UserBalance userBalance={userBalance} onClick={onUseMaxBalance} />
            }
          />
        </div>
        <div className="mt-10">
          {formError ? <FieldError error={formError} className="mb-4" /> : null}
          <Button type="submit" disabled={!canSubmit} inProgress={isSubmitting}>
            Send
          </Button>
          {send.error ? <div className="mt-2"><ErrorButton label='Error executing transaction' errorMessage={send.error.message} /></div> : null}
        </div>
      </form>
    </div>
  )
}


export const SendTokenDialog: FC<PropsWithChildren<{ address: string }>> = ({ children, address }) => {
  const value = useErc20TokenInfo(address)
  const [sendTokenDialogOpen, setSendTokenDialogOpen] = useState(false)

  const onTokenSent = useCallback(() => {
    setSendTokenDialogOpen(false)
  }, [setSendTokenDialogOpen])

  return (
    <Dialog open={sendTokenDialogOpen} onOpenChange={setSendTokenDialogOpen}>
      <DialogTrigger>
        {children}
      </DialogTrigger>
      <DialogContent>
        <ContractValue value={value} sanitizeValue={sanitizeErc20TokenInfo}>
          {({ symbol, decimals, myBalance }) => (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading mb-2">
                  Send token:<strong className="ml-2 italic">{symbol}</strong>
                </DialogTitle>
              </DialogHeader>
              <SendTokenForm 
                address={address} 
                decimals={decimals}
                userBalance={myBalance}
                onSent={onTokenSent} 
              />
            </>
          )}
        </ContractValue>
      </DialogContent>
    </Dialog>				
  )
}


const validations = {
  recipient: {
    validate: (a: string) => {
      if (!isAddress(a)) {
        return 'Must be a valid address'
      }
    }
  },
}