export enum ErrorCode {
  INTERNAL = 'INTERNAL', // internal error
  UNAUTHORIZED = 'UNAUTHORIZED', // unauthorized access
}

export interface ErrorWithCode extends Error {
  code?: ErrorCode
}

export const createError = (message: string, code = ErrorCode.INTERNAL) => {
  const e: ErrorWithCode = new Error(message)
  e.code = code
  return e
}

export const throwError = (message: string, code = ErrorCode.INTERNAL) => {
  throw createError(message, code)
}
