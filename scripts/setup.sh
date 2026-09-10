#!/usr/bin/env bash
# setup.sh – Install dependencies and copy env example
set -e

echo "Installing npm dependencies..."
npm ci

if [ -f .env.example ]; then
  echo "Copying .env.example to .env"
  cp .env.example .env
else
  echo "Warning: .env.example not found"
fi

echo "Setup complete. You can now run 'npm run dev' to start the dev server.'
