import { randomBytes } from 'node:crypto'

const command = process.argv[2]

if (command === 'generate-token') {
  const token = randomBytes(32).toString('hex')
  console.log(token)
} else {
  console.error(`Unknown command: ${command}`)
  console.error('Available commands: generate-token')
  process.exit(1)
}
