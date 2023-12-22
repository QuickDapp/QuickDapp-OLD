---
order: 94
---

# Forms

QuickDapp comes with a powerful form handling framework, comprising of hooks and components which work in tandem to make form processing easy. Its features:

Features:

* Built-in fields: dropdown, text, textarea, number.
* Ability to support any custom input type.
* Field-level sanitization, validation and error handling.
* Form-level validation and error reporting.
* Asynchronous validation with debounce delay.

The built-in example dapp illustrates all aspects of this framework.

## Hooks

There are two hooks, both found in [`src/frontend/hooks/forms.ts`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/hooks/forms.ts):

* `useForm()` - defines the fields of a form as well as form-level validation methods.
* `useField()` - defines a single field - its name, initial value, sanitization, validation and whether it is a required field.

Example usage:

```ts
const recipientField = useField({
  name: 'recipient',
  initialValue: '',
  validate: validateAddress,
})

const amountField = useField({
  name: 'amount',
  initialValue: '',
  validateAsync: validateAmount,
})

const {
  valid,
  formError,
} = useForm({
  fields: [recipient, amount],
  validateAsync: validateForm,
})
```

The validator methods are expected to return an error string if there is a validation error. This error string is what gets displayed to the user.

For example:

```ts
import { isAddress } from "viem"
import { BigVal } from "@/shared/number"
import { FieldApi } from '@/frontend/hooks'

const validateAddress = (a: string) => {
  if (!isAddress(a)) {
    return 'Must be a valid address'
  }
}

const validateAmount = async (a: striung) => {
  try {
    const n = new BigVal(a.trim(), 'coins', { decimals })
  } catch (err) {
    return 'Must be a number'
  }
}

const validateForm = async (fields: FieldApi[]) => {
  // if error then return a string
}
```

!!!
For efficiency purposes, it's best to define the validation functions outside of the component or wrapped within `useCallback` hooks so that the `useField` hook doesn't return a friend field each time.
!!!

## Components

Here is how the UI component source might look, using the properties defined earlier:

```tsx
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
    />
  </div>
  <div className="mt-10">
    {/* the "formError" property is returned by the useForm() hook */}
    {formError ? <FieldError error={formError} className="mb-4" /> : null}
    {/* the "valid" property is returned by the useForm() hook */}
    <Button type="submit" disabled={!valid}>Send</Button>
  </div>
</form>
```

The built-in components automatically display any field-level validation errors. For form level validation errors you have to manually display them as, as shown above.

The `onSubmit` handler would look similar to:

```ts
const onSubmit = useCallback(async (e: any) => {
  e.preventDefault()
  e.stopPropagation()

  // do something with the form values
}, [recipient.value, amount.value])
```
