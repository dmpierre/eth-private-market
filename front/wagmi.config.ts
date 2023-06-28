import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

export default defineConfig({
    out: 'wagmi-src/generated.ts',
    plugins: [
        foundry({
            project: '../packages/contracts/',
            include: ['PrivateMarket.json'],
        }),
    ],
});
