import { defineCollection, z } from 'astro:content'

import { HashnodeLoader } from 'astro-loader/hashnode'

const posts = defineCollection({
  loader: HashnodeLoader({
    operation: 'posts',
    publicationHost: 'adrianub.dev/hashnode',
    fields: ['slug', 'title', 'publishedAt', 'subtitle', { coverImage: ['url'], content: ['html', 'markdown'] }],
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
      markdown: z.string(),
    }),
  }),
})

const series = defineCollection({
  loader: HashnodeLoader({
    publicationHost: 'adrianub.dev/hashnode',
    operation: 'seriesList',
    fields: [
      'slug',
      'name',
      'createdAt',
      'coverImage',
      {
        description: ['html', 'markdown'],
      },
    ],
    withPosts: {
      fields: ['slug', 'title', 'publishedAt', { coverImage: ['url'] }],
    },
  }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    createdAt: z.string().transform(date => new Date(date)),
    coverImage: z.string().url(),
    description: z.object({
      html: z.string(),
      markdown: z.string(),
    }),
    posts: z.array(z.object({
      slug: z.string(),
      title: z.string(),
      publishedAt: z.string().transform(date => new Date(date)),
      coverImage: z.object({
        url: z.string().url(),
      }),
    })),
  }),
})

const pages = defineCollection({
  loader: HashnodeLoader({
    operation: 'staticPages',
    publicationHost: 'adrianub.dev/hashnode',
    fields: [
      'slug',
      'title',
      {
        content: ['html', 'markdown'],
        ogMetaData: ['image'],
      },
    ],
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    content: z.object({
      html: z.string(),
      markdown: z.string(),
    }),
    ogMetaData: z.object({
      image: z.string().url(),
    }),
  }),
})

export const collections = { posts, series, pages }
