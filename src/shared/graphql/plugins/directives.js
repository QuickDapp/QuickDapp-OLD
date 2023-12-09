const { visit } = require('graphql')
const { getCachedDocumentNodeFromSchema } = require('@graphql-codegen/plugin-helpers')

const OPERATIONS = ['Query', 'Mutation', 'Subscription']

module.exports = {
  plugin: (schema) => {
    const astNode = getCachedDocumentNodeFromSchema(schema)

    const dirsToOps = {}
    const opsToDirs = {}
    let inOperationsDefs = false

    const enter = (node) => {
      if (node.kind === 'ObjectTypeDefinition' && (OPERATIONS.includes(node.name.value))) {
        inOperationsDefs = true
      }
    }

    const leave = (node) => {
      if (node.kind === 'DirectiveDefinition') {
        dirsToOps[node.name.value] = []
        return
      }

      if (node.kind === 'ObjectTypeDefinition' && OPERATIONS.includes(node.name.value)) {
        inOperationsDefs = false
        return
      }

      if (inOperationsDefs && node.kind === 'FieldDefinition') {
        const { directives = [] } = node
        directives.forEach(d => {
          const { name: { value: directiveName } } = d

          if (!dirsToOps[directiveName]) {
            dirsToOps[directiveName] = []
          }

          dirsToOps[directiveName].push(node.name.value)

          if (!opsToDirs[node.name.value]) {
            opsToDirs[node.name.value] = []
          }
          opsToDirs[node.name.value].push(directiveName)
        })
      }
    }

    visit(astNode, { enter, leave })

    return {
      content: `
export const directives = ${JSON.stringify(dirsToOps, null, 2)}
export const operations = ${JSON.stringify(opsToDirs, null, 2)}
`,
    }
  }
}
