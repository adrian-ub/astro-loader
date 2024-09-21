import { defineCollection, z } from 'astro:content'

import { HashnodeLoaderPosts, HashnodeLoaderSeries } from 'astro-loader/hashnode'

const posts = defineCollection({
  loader: HashnodeLoaderPosts({
    publicationHost: 'adrianub.dev/hashnode',
    fields: ['title', 'publishedAt', 'subtitle', { coverImage: ['url'], content: ['html'] }],
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    publishedAt: z.string().transform(date => new Date(date)),
    coverImage: z.object({
      url: z.string().url(),
    }),
    content: z.object({
      html: z.string(),
    }),
  }),
})

const series = defineCollection({
  loader: HashnodeLoaderSeries({
    publicationHost: 'adrianub.dev/hashnode',
    fields: [
      'name',
      'createdAt',
      'coverImage',
      {
        description: ['html'],
      },
      {
        operation: 'posts',
        variables: {
          first: {
            name: 'first',
            required: true,
            value: 20,
            type: 'Int',
          },
        },
        fields: [{
          edges: [{
            node: ['slug', 'title', 'publishedAt', { coverImage: ['url'] }],
          }],
        }],
      },
    ],
  }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    createdAt: z.string().transform(date => new Date(date)),
    coverImage: z.string().url(),
    description: z.object({
      html: z.string(),
    }),
    posts: z.object({
      edges: z.array(z.object({
        node: z.object({
          slug: z.string(),
          title: z.string(),
          publishedAt: z.string().transform(date => new Date(date)),
          coverImage: z.object({
            url: z.string().url(),
          }),
        }),
      })),
    }),
  }),
})

export const collections = { posts, series }
