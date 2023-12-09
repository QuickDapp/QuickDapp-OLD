// Recommended by: https://the-guild.dev/graphql/scalars/docs/scalars/big-int
require('json-bigint-patch')

import { GraphQLDateTime, GraphQLJSON, GraphQLPositiveInt, GraphQLBigInt } from "graphql-scalars"

import possibleTypes from './generated/possibleTypes'

export const defaultResolvers = {
  // scalars
  BigInt: GraphQLBigInt,
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
  PositiveInt: GraphQLPositiveInt,
  // unions
  ...Object.entries(possibleTypes.possibleTypes).reduce((m, [unionName, unionTypes]) => {
    const errorTypeIndex = unionTypes.findIndex(t => t === 'Error')
    const normalTypeIndex = unionTypes.findIndex(t => t !== 'Error')
    m[unionName] = {
      __resolveType({ error }: any) {
        if (error) {
          return unionTypes[errorTypeIndex]
        } else {
          return unionTypes[normalTypeIndex]
        }
      },
    }
    return m
  }, {} as Record<string, any>),
}
