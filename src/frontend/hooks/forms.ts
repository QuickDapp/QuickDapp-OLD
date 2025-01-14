"use client"

import pDebounce from "p-debounce"
import { useCallback, useEffect, useMemo, useState } from "react"

export type HandleFieldChangeFunction<T = any> = (v: T) => void
export type SanitizeFunction<T = any> = (v: T) => T
export type ValidateFunction<T = any> = (
  v: T,
  extraArgs?: any,
) => string | undefined
export type ValidateAsyncFunction<T = any> = (
  v: T,
  extraArgs?: any,
) => Promise<string | undefined>

export interface FieldApi<T> {
  name: string
  value: T | undefined
  valid: boolean
  error?: string
  version: number
  isSet: boolean
  isValidating: boolean
  handleChange: HandleFieldChangeFunction
  unset: () => void
}

export interface FieldOptions<T> {
  name: string
  initialValue?: T
  optional?: boolean
  sanitize?: SanitizeFunction
  validate?: ValidateFunction
  validateAsync?: ValidateAsyncFunction
  validateAsyncDebounceMs?: number
  validateExtraArgs?: any
}

const DUMMY_VALIDATE_ASYNC_FN = async () => ""

export const useField = <T = any>(options: FieldOptions<T>): FieldApi<T> => {
  const [version, setVersion] = useState<number>(0)
  const [value, setValue] = useState<T | undefined>(options.initialValue)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isSet, setIsSet] = useState<boolean>(
    options.optional ? true : !!options.initialValue,
  )
  const [isValidating, setIsValidating] = useState<boolean>(false)

  const debouncedValidateAsync = useAsyncValidator(
    options.validateAsync,
    options.validateAsyncDebounceMs,
  )

  const validate = useCallback(
    async (v: T) => {
      const syncValidationError = options.validate
        ? options.validate(v, options.validateExtraArgs)
        : ""
      if (syncValidationError) {
        setError(syncValidationError)
      } else if (options.validateAsync) {
        setError(await debouncedValidateAsync(v, options.validateExtraArgs))
      } else {
        setError(undefined)
      }
      setIsValidating(false)
    },
    [debouncedValidateAsync, options],
  )

  const handleChange: HandleFieldChangeFunction = useCallback(
    (v: any) => {
      const val = options.sanitize ? options.sanitize(v) : v
      setVersion(version + 1)
      setValue(val)
      setIsSet(true)
      setIsValidating(true)
      setTimeout(() => validate(val))
    },
    [options, validate, version],
  )

  const unset = useCallback(() => {
    setValue(options.initialValue)
    setIsSet(false)
    setError(undefined)
  }, [options.initialValue])

  const valid = useMemo(() => !error && !isValidating, [error, isValidating])

  return {
    name: options.name,
    value,
    valid,
    isSet,
    error: isSet ? error : undefined,
    version,
    isValidating,
    handleChange,
    unset,
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
  fields: FieldApi<any>[]
  validate?: ValidateFunction
  validateAsync?: ValidateAsyncFunction
  validateExtraArgs?: any
  validateAsyncDebounceMs?: number
}

export const useForm = (options: FormOptions): FormApi => {
  const { fields } = options
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [_isValidating, setIsValidating] = useState<boolean>(false)

  const isValidating = useMemo(() => {
    return _isValidating || fields.some((f) => f.isValidating)
  }, [_isValidating, fields])

  const valid = useMemo(() => {
    if (formError) {
      return false
    }
    return fields.reduce((m: boolean, f) => m && f.valid && f.isSet, true)
  }, [fields, formError])

  const errors = useMemo(() => {
    const fieldErrors = fields.reduce(
      (m: string[], f) => (f.error ? m.concat(f.error) : m),
      [],
    )
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
    fields.forEach((f) => {
      f.unset()
    })
  }, [fields])

  const debouncedValidateAsync = useAsyncValidator(
    options.validateAsync,
    options.validateAsyncDebounceMs,
  )

  const validate = useCallback(
    async (f: FieldApi<any>[]) => {
      setIsValidating(true)

      const map = f.reduce((m: Record<string, any>, f) => {
        m[f.name] = f
        return m
      }, {})

      const syncValidationError = options.validate
        ? options.validate(map, options.validateExtraArgs)
        : ""

      if (syncValidationError) {
        setFormError(syncValidationError)
      } else if (options.validateAsync) {
        setFormError(
          await debouncedValidateAsync(map, options.validateExtraArgs),
        )
      } else {
        setFormError(undefined)
      }

      setIsValidating(false)
    },
    [debouncedValidateAsync, options],
  )

  // biome-ignore lint: version
  useEffect(() => {
    validate(fields)
  }, [
    fields,
    validate,
    version /* when version changes re-do the validation */,
  ])

  return { valid, version, errors, formError, reset, values, isValidating }
}

const useAsyncValidator = (
  validateAsync: (
    v: any,
    extraArgs?: any,
  ) => Promise<string | undefined> = DUMMY_VALIDATE_ASYNC_FN,
  debounceMs: number = 0,
) => {
  const debouncedValidateAsync = useMemo(() => {
    return pDebounce(validateAsync, debounceMs)
  }, [validateAsync, debounceMs])

  const validate = useCallback(
    async (v: any, extraArgs?: any) => {
      try {
        return await debouncedValidateAsync(v, extraArgs)
      } catch (err: any) {
        console.error(`Error running async validator`, err)
        return `${err}`
      }
    },
    [debouncedValidateAsync],
  )

  return validate
}
