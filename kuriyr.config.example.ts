import { defineConfig } from './src/config.js'

export default defineConfig({
  from: {
    name: 'My App',
    email: 'noreply@example.com',
  },
  defaultLocale: 'en',
  port: 4400,
  providers: {
    email: {
      type: 'smtp',
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-user',
        pass: 'your-password',
      },
    },
  },
})
