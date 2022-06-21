import { build } from 'vite'

await build({ configFile: 'src/frontend/vite.config.ts' })
await build({ configFile: 'src/backend/vite.config.ts' })
