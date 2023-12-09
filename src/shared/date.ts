import { format } from 'date-fns'

export const ONE_SECOND = 1000
export const ONE_MINUTE = 60 * ONE_SECOND
export const ONE_HOUR = 60 * ONE_MINUTE
export const ONE_DAY = 24 * ONE_HOUR
export const ONE_WEEK = 7 * ONE_DAY
export const ONE_MONTH = 30 * ONE_DAY

export const dateNow = () => {
  return new Date()
}

export const dateFrom = (d: any) => {
  return new Date(d)
}

export const dateToISOString = (d: any) => {
  return dateFrom(d).toISOString()
}

export const dateFriendlyFormat = (d: any) => {
  if (dateDiff(d, dateNow()) < ONE_DAY) {
    return format(dateFrom(d), 'h:mm a')
  } else {
    return format(dateFrom(d), 'MMM d')
  }
}

export const dateFormatStr = (d: any, fmt: string) => {
  return format(dateFrom(d), fmt)
}

export const dateDiff = (earlier: any, later: any) => {
  return dateFrom(later).getTime() - dateFrom(earlier).getTime()
}

export const dateBefore = (before: any, after: any) => {
  return before && after && dateDiff(before, after) >= 0
}

export const dateBetween = (d: any, before: any, after: any) => {
  return before && after && dateDiff(before, d) >= 0 && dateDiff(d, after) >= 0
}
