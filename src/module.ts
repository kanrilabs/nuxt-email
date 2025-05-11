import { defineNuxtModule, createResolver, addServerImports } from '@nuxt/kit'

export interface ModuleOptions {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Nuxt Email',
    configKey: 'email',
  },
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    addServerImports([
      { name: 'useEmail', from: resolver.resolve('./runtime/server/client') },
      { name: 'MailBuilder', from: resolver.resolve('./runtime/server/builder') },
    ])
  },
})
