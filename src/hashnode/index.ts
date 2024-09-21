import * as gql from 'gql-query-builder'
import { GraphQLClient } from 'graphql-request'
import type { Loader } from 'astro/loaders'

export interface HashnodeLoaderOptions {
  operation: 'seriesList' | 'posts' | 'staticPages'
  endpoint?: string
  publicationHost: string
  fields: Array<string | object>
  variables?: Array<object>
}

async function fetchAllData(
  client: GraphQLClient,
  { fields, variables, operation }: Pick<HashnodeLoaderOptions, 'variables' | 'fields' | 'operation'>,
): Promise<any[]> {
  const publication = 'publication'

  let data: object[] = []
  let hasNextPage = true
  let endCursor = null

  // Loop through all pages of data
  while (hasNextPage) {
    // build the query
    const query = gql.query({
      operation: publication,
      fields: [{
        operation,
        variables: {
          first: {
            name: 'first',
            required: true,
            value: 20,
            type: 'Int',
          },
          after: {
            name: 'after',
            required: false,
            value: endCursor,
            type: 'String',
          },
        },
        fields: [{
          pageInfo: ['endCursor', 'hasNextPage'],
        }, {
          edges: [
            {
              node: ['id', ...fields],
            },
          ],
        }],
      }],
      variables: {
        ...variables,
        // if endCursor exists, add it to the variables otherwise, don't
        ...(endCursor && { after: endCursor }),
      },
    })

    // make the request with query and variables
    const res = await client.request<{
      publication: {
        [key: string]: {
          pageInfo: {
            endCursor: string
            hasNextPage: boolean
          }
          edges: Array<{
            node: object
          }>
        }
      }
    }>(query.query, query.variables)

    // if next page exists, update endCursor and hasNextPage and call the function again
    if (res[publication][operation].pageInfo.hasNextPage) {
      endCursor = res[publication][operation].pageInfo.endCursor
      data = [...data, ...res[publication][operation].edges]
      hasNextPage = res[publication][operation].pageInfo.hasNextPage
    }
    else {
      data = [...data, ...res[publication][operation].edges]
      hasNextPage = false
    }
  }

  return data
}

export function HashnodeLoader({ endpoint = 'https://gql.hashnode.com', fields, variables = [], publicationHost, operation }: HashnodeLoaderOptions): Loader {
  if (!endpoint) {
    throw new Error('Hashnode requires an endpoint')
  }

  if (!fields) {
    throw new Error('Hashnode requires fields to be defined')
  }

  const client = new GraphQLClient(endpoint)

  const connectionVariables = {
    ...variables,
    host: publicationHost,
  }

  return {
    name: 'astro-loader-hashnode',
    load: async ({ logger, store, parseData }) => {
      logger.info(`Loading ${operation} data from Hashnode`)
      store.clear()

      const data = await fetchAllData(client, { fields, variables: connectionVariables, operation })

      for (const item of data) {
        const itemData = item.node
        const parsedData = await parseData({ id: itemData.id, data: itemData })
        store.set({
          id: itemData.id,
          data: parsedData,
        })
      }

      logger.info(
        `Finished loading ${operation} with ${store.entries().length} items`,
      )
    },
  }
}

/**
 * @deprecated Use HashnodeLoader instead
 */
export const HashnodeLoaderSeries = (args: Omit<HashnodeLoaderOptions, 'operation'>): Loader => HashnodeLoader({ ...args, operation: 'seriesList' })
/**
 * @deprecated Use HashnodeLoader instead
 */
export const HashnodeLoaderPosts = (args: Omit<HashnodeLoaderOptions, 'operation'>): Loader => HashnodeLoader({ ...args, operation: 'posts' })
