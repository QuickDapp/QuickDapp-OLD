import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const truncateStr = (str: string, length: number) => {
  if (str.length <= length) {
    return str
  }
  return str.substring(0, length) + '...'
}

export type PropsWithClassName<P = unknown> = P & { className?: string }