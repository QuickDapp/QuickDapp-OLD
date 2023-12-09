import _ from 'lodash'
import { ErrorCode } from "../errors"

export const createErrorResponse = (message: string, code = ErrorCode.INTERNAL) => {
  return {
    error: {
      __typename: 'ErrorDetails',
      code,
      message,
    },
  }
}



export const resolveError = (result: any) => {
  const { data, error } = result
  const dataError = _.get(data, `${Object.keys(data || {})[0]}.error`)
  return dataError || error
}



/**
 * Stringify given GraphQL request error.
 *
 * @param  {*} err Error from GraphQL call.
 * @return {String}
 */
export const stringifyError = (err: any) => {
  if (Array.isArray(err)) {
    [err] = err
  }

  const code = err.code || _.get(err, 'extensions.code')

  const str = [
    code ? `${err.message} (code: ${code})` : err.message
  ]

  const stackTrace = _.get(err, 'extensions.exception.stacktrace')
  if (stackTrace) {
    str.push(stackTrace[0])
  }

  _.get(err, 'networkError.result.errors', []).forEach((e: any) => {
    str.push(stringifyError(e))
  })

  return str.join('\n')
}