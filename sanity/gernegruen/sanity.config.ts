import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { deDELocale } from '@sanity/locale-de-de'

export default defineConfig({
  name: 'default',
  title: 'gernegruen',

  projectId: 'zqaggz4f',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), deDELocale(),
  ],

  schema: {
    types: schemaTypes,
  },
})
