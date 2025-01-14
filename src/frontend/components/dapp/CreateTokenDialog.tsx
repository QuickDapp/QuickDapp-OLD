"use client"

import { Button } from "@/frontend/components/Button"
import { FieldError, NumberInput, TextInput } from "@/frontend/components/Form"
import { useField, useForm, useSetContractValue } from "@/frontend/hooks"
import { ContractName } from "@/shared/contracts"
import { BigVal, toNumber } from "@/shared/number"
import { FC, useCallback, useMemo, useState } from "react"
import { TransactionReceipt } from "viem"
import { Dialog, DialogContent, DialogTrigger } from "../Dialog"
import { ErrorButton } from "../ErrorButton"

const CreateTokenForm: FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [name, symbol, decimals] = [
    useField({
      name: "name",
      initialValue: "",
      validate: validations.name.validate,
    }),
    useField<string>({
      name: "symbol",
      initialValue: "",
      validate: validations.symbol.validate,
    }),
    useField<number>({
      name: "decimals",
      initialValue: 18,
      validate: validations.decimals.validate,
      sanitize: validations.decimals.sanitize,
    }),
  ]

  const { valid, formError } = useForm({
    fields: [name, symbol, decimals],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = useSetContractValue({
    functionName: "erc20DeployToken",
    contract: ContractName.DiamondProxy,
  })

  const canSubmit = useMemo(() => {
    return valid && !isSubmitting && create.canExec
  }, [valid, isSubmitting, create.canExec])

  const onSubmit = useCallback(
    async (e: any) => {
      e.preventDefault()
      e.stopPropagation()

      create.reset()

      setIsSubmitting(true)

      try {
        const initialBalance = new BigVal(100, "coins", {
          decimals: toNumber(decimals.value),
        })
          .toMinScale()
          .toString()
        ;(await create.exec({
          successToastMsg: `Created token: ${name.value} (${symbol.value})`,
          args: [
            {
              name: name.value,
              symbol: symbol.value,
              decimals: decimals.value,
            },
            initialBalance,
          ],
        })) as TransactionReceipt

        onCreated()
      } catch (e: any) {
        console.error(e)
      } finally {
        setIsSubmitting(false)
      }
    },
    [create, decimals.value, name.value, symbol.value, onCreated],
  )

  return (
    <form onSubmit={onSubmit}>
      <div className="mt-4 max-w-xs">
        <TextInput
          field={name}
          label="Name"
          help="Token name"
          className="w-80"
          maxChars={10}
          showCharCount={true}
          required={true}
          placeholder="Name..."
        />
      </div>
      <div className="mt-4 max-w-xs">
        <TextInput
          field={symbol}
          label="Symbol"
          help="Token symbol"
          className="w-80"
          maxChars={6}
          showCharCount={true}
          required={true}
          placeholder="Symbol..."
        />
      </div>
      <div className="mt-4 max-w-xs">
        <NumberInput
          field={decimals}
          label="Decimals"
          help="No. of decimals."
          className="w-30"
          required={true}
          min={1}
          max={18}
          step={1}
        />
      </div>
      <div className="mt-12">
        {formError ? <FieldError error={formError} className="mb-4" /> : null}
        <Button type="submit" disabled={!canSubmit} inProgress={isSubmitting}>
          Create
        </Button>
        {create.error ? (
          <div className="mt-2">
            <ErrorButton
              label="Error executing transaction"
              errorMessage={create.error.message}
            />
          </div>
        ) : null}
      </div>
    </form>
  )
}

const validations = {
  name: {
    validate: (a: string) => {
      if (!a.match(/^[A-Za-z_]{1,10}$/)) {
        return "Must be 10 characters or less, and only contain letters and underscores"
      }
    },
  },
  symbol: {
    validate: (a: string) => {
      if (!a.match(/^[A-Z]{1,6}$/)) {
        return "Must be 6 characters or less, and only contain uppercase letters"
      }
    },
  },
  decimals: {
    sanitize: (a: string) => Number(a),
    validate: (a: number) => {
      if (a < 2 || a > 18) {
        return "Must be between 2 and 18"
      }
    },
  },
}

export const CreateTokenDialog = () => {
  const [createTokenDialogOpen, setCreateTokenDialogOpen] = useState(false)

  const onTokenCreated = useCallback(() => {
    setCreateTokenDialogOpen(false)
  }, [])

  return (
    <Dialog
      open={createTokenDialogOpen}
      onOpenChange={setCreateTokenDialogOpen}
    >
      <DialogTrigger>
        <Button size="sm" asChild={true}>
          <span>Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CreateTokenForm onCreated={onTokenCreated} />
      </DialogContent>
    </Dialog>
  )
}
