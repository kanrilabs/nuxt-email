export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  email: {
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  },
})
