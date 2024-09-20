import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    {
      input: 'src/hashnode/index',
      outDir: 'dist/hashnode',
    },
  ],
  declaration: true,
  clean: true,
  externals: [
    'astro',
  ],
})
