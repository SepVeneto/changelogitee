#!/bin/sh

# when error exit at once
set -e

pnpm i --frozen-lockfile --registry=https://registry.npmmirror.com

pnpm build

pnpm publish --no-git-checks --access public

echo "✅ Publish completed"