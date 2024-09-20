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

```ts
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
