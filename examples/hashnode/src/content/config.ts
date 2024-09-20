import { defineCollection, z } from 'astro:content'

import { HashnodeLoaderPosts } from 'astro-loader/hashnode'

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

export const collections = { posts }
