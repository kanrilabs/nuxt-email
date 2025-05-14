import { defineNuxtModule, createResolver, addServerImports } from '@nuxt/kit'
import { defu } from 'defu'

type AwsRegion =
  | 'us-east-1'
  | 'us-east-2'
  | 'us-west-1'
  | 'us-west-2'
  | 'af-south-1'
  | 'ap-east-1'
  | 'ap-south-1'
  | 'ap-south-2'
  | 'ap-southeast-1'
  | 'ap-southeast-2'
  | 'ap-southeast-3'
  | 'ap-southeast-4'
  | 'ap-southeast-5'
  | 'ap-southeast-7'
  | 'ap-northeast-1'
  | 'ap-northeast-2'
  | 'ap-northeast-3'
  | 'ca-central-1'
  | 'ca-west-1'
  | 'eu-central-1'
  | 'eu-central-2'
  | 'eu-west-1'
  | 'eu-west-2'
  | 'eu-west-3'
  | 'eu-south-1'
  | 'eu-south-2'
  | 'eu-north-1'
  | 'il-central-1'
  | 'me-south-1'
  | 'me-central-1'
  | 'sa-east-1'
  | 'mx-central-1'
  | 'us-gov-east-1'
  | 'us-gov-west-1'

export interface ModuleOptions {
  endpoint: string
  region: AwsRegion
  fromAddress: {
    name: string
    email: string
  }
}

export interface EmailConfig extends Partial<ModuleOptions> {
  accessKeyId: string
  secretAccessKey: string
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    email: EmailConfig
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Nuxt Email',
    configKey: 'email',
  },
  defaults: {
    region: 'us-east-1',
  },
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.email = defu(nuxt.options.runtimeConfig.email, {
      region: options.region,
      fromAddress: options.fromAddress,
      endpoint: options.endpoint,
    })

    const resolver = createResolver(import.meta.url)

    nuxt.options.alias['#email'] = resolver.resolve('./runtime/types/index')

    addServerImports([
      { name: 'useEmail', from: resolver.resolve('./runtime/server/client') },
      { name: 'defineSESEventHandler', from: resolver.resolve('./runtime/server/ses/event') },
    ])
  },
})
