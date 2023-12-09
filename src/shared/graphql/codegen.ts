import path from 'path'
import { CodegenConfig } from "@graphql-codegen/cli"

const directivesPlugin = path.join(__dirname, './plugins/directives.js')
const schema = path.join(__dirname, 'schema.ts')
const fragments = path.join(__dirname, 'fragments.ts')
const queries = path.join(__dirname, 'queries.ts')
const mutations = path.join(__dirname, 'mutations.ts')
const genFolder = path.join(__dirname, 'generated/')
const types = path.join(__dirname, 'generated', 'types.ts')
const possibleTypes = path.join(__dirname, 'generated', 'possibleTypes.ts')
const directives = path.join(__dirname, 'generated', 'directives.ts')

const config: CodegenConfig = {
  schema,
  documents: [fragments, queries, mutations],
  generates: {
    [genFolder]: {
      preset: 'client',
    },
    [types]: {
      config: {
        useIndexSignature: true,
        allowEnumStringTypes: true,
        printFieldsOnNewLines: true,
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    [possibleTypes]: {
      plugins: ['@graphql-codegen/fragment-matcher'],
    },
    [directives]: {
      plugins: [directivesPlugin],
    },
  },
}

export default config
