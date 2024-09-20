import * as gql from 'gql-query-builder'
import { GraphQLClient } from 'graphql-request'
import type { Loader } from 'astro/loaders'

export interface HashnodeLoaderPostsOptions {
  endpoint?: string
  publicationHost: string
  fields: Array<string | object>
  variables?: Array<object>
}

async function fetchAllData(
  client: GraphQLClient,
  { fields, variables }: Pick<HashnodeLoaderPostsOptions, 'variables' | 'fields'>,
): Promise<any[]> {
  const operation = 'publication'
  let data: object[] = []
  let hasNextPage = true
  let endCursor = null

  // Loop through all pages of data
  while (hasNextPage) {
    // build the query
    const query = gql.query({
      operation,
      fields: [{
        operation: 'posts',
        variables: {
          first: {
            name: 'first',
            required: true,
            value: 50,
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
              node: ['slug', ...fields],
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
      [operation]: {
        posts: {
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
    if (res[operation].posts.pageInfo.hasNextPage) {
      endCursor = res[operation].posts.pageInfo.endCursor
      data = [...data, ...res[operation].posts.edges]
      hasNextPage = res[operation].posts.pageInfo.hasNextPage
    }
    else {
      data = [...data, ...res[operation].posts.edges]
      hasNextPage = false
    }
  }

  return data
}

export function HashnodeLoaderPosts({ endpoint = 'https://gql.hashnode.com', fields, variables = [], publicationHost }: HashnodeLoaderPostsOptions): Loader {
  if (!endpoint) {
    throw new Error('HygraphLoader requires an endpoint')
  }

  if (!fields) {
    throw new Error('HygraphLoader requires fields to be defined')
  }

  const client = new GraphQLClient(endpoint)

  const connectionVariables = {
    ...variables,
    host: publicationHost,
  }

  return {
    name: 'astro-loader-hashnode',
    load: async ({ logger, store, parseData }) => {
      logger.info(`Loading posts data from Hashnode`)
      store.clear()

      const data = await fetchAllData(client, { fields, variables: connectionVariables })

      for (const item of data) {
        const itemData = item.node
        const parsedData = await parseData({ id: itemData.slug, data: itemData })
        store.set({
          id: parsedData.slug,
          data: parsedData,
          rendered: {
            html: itemData.content?.html || itemData.content?.markdown || '',
          },
        })
      }

      logger.info(
        `Finished loading posts with ${store.entries().length} items`,
      )
    },
  }
}
