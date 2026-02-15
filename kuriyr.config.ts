import { defineConfig } from './src/config.js'

export default defineConfig({
  from: {
    name: 'Kuriyr',
    email: 'noreply@example.com',
  },
  defaultLocale: 'en',
  port: 4400,
  providers: {
    email: {
      type: 'smtp',
      host: 'localhost',
      port: 1025,
    },
  },
})
