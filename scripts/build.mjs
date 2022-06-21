import { build } from 'vite'

await build({ configFile: 'src/main/vite.config.ts' })
await build({ configFile: 'src/bridge/vite.config.ts' })
await build({ configFile: 'src/view/vite.config.ts' })
