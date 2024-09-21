# astro-loader

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A package for loading content into Astro's Content Collection API

## Install

```sh
pnpm add astro-loader
```

## loaders

<details>
<summary>astro-loader/hashnode</summary>

### Posts

```ts
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

export const collections = { posts }
```

### Series

```ts
import { defineCollection, z } from 'astro:content'

import { HashnodeLoader } from 'astro-loader/hashnode'

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

export const collections = { series }
```

### Pages

```ts
import { defineCollection, z } from 'astro:content'

import { HashnodeLoader } from 'astro-loader/hashnode'

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

export const collections = { pages }
```

</details>

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/adrian-ub/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/adrian-ub/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2024-PRESENT [Adrián UB](https://github.com/adrian-ub)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/astro-loader?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/astro-loader
[npm-downloads-src]: https://img.shields.io/npm/dm/astro-loader?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/astro-loader
[bundle-src]: https://img.shields.io/bundlephobia/minzip/astro-loader?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=astro-loader
[license-src]: https://img.shields.io/github/license/adrian-ub/astro-loader.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/adrian-ub/astro-loader/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/astro-loader
