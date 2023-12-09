"use client"

import pDebounce from 'p-debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type HandleFieldChangeFunction<T = any> = (v: T) => void
export type SanitizeFunction<T = any> = (v: T) => T
export type ValidateFunction<T = any> = (v: T) => string | undefined
export type ValidateAsyncFunction<T = any> = (v: T) => Promise<string | undefined>

export interface FieldApi {
  name: string
  value: any
  valid: boolean
  error?: string
  version: number
  isSet: boolean
  isValidating: boolean
  handleChange: HandleFieldChangeFunction
}

export interface FieldOptions {
  name: string
  initialValue?: any
  optional?: boolean
  sanitize?: SanitizeFunction
  validate?: ValidateFunction
  validateAsync?: ValidateAsyncFunction
  validateAsyncDebounceMs?: number
}

const DUMMY_VALIDATE_ASYNC_FN = async () => ''

export const useField = (options: FieldOptions): FieldApi => {
  const [version, setVersion] = useState<number>(0)
  const [value, setValue] = useState<any>(options.initialValue)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isSet, setIsSet] = useState<boolean>(options.optional ? true : !!options.initialValue)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  const debouncedValidateAsync = useAsyncValidator(options.validateAsync, options.validateAsyncDebounceMs)

  const validate = useCallback(
    async (v: any) => {
      const syncValidationError = options.validate ? options.validate(v) : ''
      if (syncValidationError) {
        setError(syncValidationError)
      } else if (options.validateAsync) {
        setIsValidating(true)
        setError(await debouncedValidateAsync(v))
        setIsValidating(false)
      } else {
        setError(undefined)
      }
    },
    [debouncedValidateAsync, options]
  )

  const handleChange: HandleFieldChangeFunction = useCallback(
    (v: any) => {
      const val = options.sanitize ? options.sanitize(v) : v
      setVersion(version + 1)
      setValue(val)
      setIsSet(true)
      setTimeout(() => validate(val))
    },
    [options, validate, version]
  )

  const valid = useMemo(() => !error, [error])

  return {
    name: options.name,
    value,
    valid,
    isSet,
    error: isSet ? error : undefined,
    version,
    isValidating,
    handleChange,
  }
}

export interface FormApi {
  valid: boolean
  values: Record<string, any>
  formError?: string
  errors: string[]
  version: number
  isValidating: boolean
  reset: () => void
}

export interface FormOptions {
  fields: FieldApi[]
  validate?: ValidateFunction
  validateAsync?: ValidateAsyncFunction
  validateAsyncDebounceMs?: number
}

export const useForm = (options: FormOptions): FormApi => {
  const { fields } = options
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  const valid = useMemo(() => {
    if (formError) {
      return false
    }
    return fields.reduce((m: boolean, f) => m && f.valid && f.isSet, true)
  }, [fields, formError])

  const errors = useMemo(() => {
    const fieldErrors = fields.reduce((m: string[], f) => (f.error ? m.concat(f.error) : m), [])
    if (formError) {
      fieldErrors.push(formError)
    }
    return fieldErrors
  }, [formError, fields])

  const version = useMemo(() => {
    return fields.reduce((m: number, v) => m + v.version, 0)
  }, [fields])

  const values = useMemo(() => {
    return fields.reduce((m: Record<string, any>, f) => {
      m[f.name] = f.value
      return m
    }, {})
  }, [fields])

  const reset = useCallback(() => {
    fields.forEach(f => {
      f.handleChange('')
    })
  }, [fields])

  const debouncedValidateAsync = useAsyncValidator(options.validateAsync, options.validateAsyncDebounceMs)

  const validate = useCallback(
    async (f: FieldApi[]) => {
      const map = f.reduce((m: Record<string, any>, f) => {
        m[f.name] = f
        return m
      }, {})

      const syncValidationError = options.validate ? options.validate(map) : ''

      if (syncValidationError) {
        setFormError(syncValidationError)
      } else if (options.validateAsync) {
        setIsValidating(true)
        setFormError(await debouncedValidateAsync(map))
        setIsValidating(false)
      } else {
        setFormError(undefined)
      }
    },
    [debouncedValidateAsync, options]
  )

  useEffect(() => {
    validate(fields)
  }, [fields, validate, version /* when version changes re-do the validation */])

  return { valid, version, errors, formError, reset, values, isValidating }
}

const useAsyncValidator = (
  validateAsync: (v: any) => Promise<string | undefined> = DUMMY_VALIDATE_ASYNC_FN,
  debounceMs: number = 0
) => {
  const debouncedValidateAsync = useMemo(() => {
    return pDebounce(validateAsync, debounceMs)
  }, [validateAsync, debounceMs])

  const validate = useCallback(
    async (v: any) => {
      try {
        return await debouncedValidateAsync(v)
      } catch (err: any) {
        console.error(`Error running validator`, err)
        return `${err}`
      }
    },
    [debouncedValidateAsync]
  )

  return validate
}
