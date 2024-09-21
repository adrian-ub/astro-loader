import * as gql from 'gql-query-builder'
import { GraphQLClient } from 'graphql-request'
import type { Loader } from 'astro/loaders'

import type IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions'
import { flattenEdges } from '../utils/flatten-edges'

type QueryBuilderOptionsWithOperation = Omit<IQueryBuilderOptions, 'operation'>
export type HashnodeLoaderOptions = QueryBuilderOptionsWithOperation & {
  operation: 'seriesList' | 'posts' | 'staticPages'
  endpoint?: string
  publicationHost: string
  [key: `with${string}`]: QueryBuilderOptionsWithOperation
}
type HashnodeLoaderOptionsWithOperation = HashnodeLoaderOptions & { operation: string }

function getFieldsWithOperation(fields: HashnodeLoaderOptions): IQueryBuilderOptions[] {
  const result = []

  for (const key in fields) {
    if (key.startsWith('with')) {
      result.push({
        operation: key.slice(4).toLowerCase(),
        variables: fields[key as `with${string}`].variables,
        fields: fields[key as `with${string}`].fields,
      })
    }
  }

  return result
}

async function fetchAllData(
  client: GraphQLClient,
  options: HashnodeLoaderOptionsWithOperation,
): Promise<any[]> {
  const { fields, variables = [], operation, publicationHost } = options
  const publication = 'publication'

  let data: object[] = []
  let hasNextPage = true
  let endCursor = null

  // Loop through all pages of data
  while (hasNextPage) {
    const queryOptions = {
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
              node: [
                'id',
                ...fields ?? [],
                ...getFieldsWithOperation(options).map(({ operation, fields, variables }) => {
                  return {
                    operation,
                    variables: {
                      first: {
                        name: 'first',
                        required: true,
                        value: 20,
                        type: 'Int',
                      },
                      ...variables,
                    },
                    fields: [{
                      edges: [{
                        node: [...(fields ?? [])],
                      }],
                    }],
                  }
                }),
              ],
            },
          ],
        }],
      }],
      variables: {
        ...variables,
        host: publicationHost,
        // if endCursor exists, add it to the variables otherwise, don't
        ...(endCursor && { after: endCursor }),
      },
    }

    // build the query
    const query = gql.query(queryOptions)

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

    hasNextPage = res[publication][operation].pageInfo.hasNextPage
    endCursor = res[publication][operation].pageInfo.endCursor

    data = [...data, ...flattenEdges(res[publication])[operation]]
  }

  return data
}

export function HashnodeLoader(options: HashnodeLoaderOptions): Loader {
  const { endpoint = 'https://gql.hashnode.com', fields, operation } = options
  if (!endpoint) {
    throw new Error('Hashnode requires an endpoint')
  }

  if (!fields) {
    throw new Error('Hashnode requires fields to be defined')
  }

  const client = new GraphQLClient(endpoint)

  return {
    name: 'astro-loader-hashnode',
    load: async ({ logger, store, parseData }) => {
      logger.info(`Loading ${operation} data from Hashnode`)
      store.clear()

      const data = await fetchAllData(client, options)

      for (const item of data) {
        const parsedData = await parseData({ id: item, data: item })
        store.set({
          id: item.id,
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
