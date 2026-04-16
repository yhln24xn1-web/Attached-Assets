#!/bin/bash
set -e

echo "==> Building frontend (bmt-decor)..."
pnpm --filter @workspace/bmt-decor run build

echo "==> Building API server..."
pnpm --filter @workspace/api-server run build

echo "==> Copying frontend assets to API server public dir..."
mkdir -p artifacts/api-server/dist/public
cp -r artifacts/bmt-decor/dist/public/. artifacts/api-server/dist/public/

echo "==> Build complete."
