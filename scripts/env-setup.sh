#!/bin/sh
set -eu
if [ -e .env.local ]; then
  printf '%s\n' '.env.local already exists; leaving it unchanged.'
else
  cp .env.example .env.local
  printf '%s\n' 'Created .env.local. Add DEEPSEEK_API_KEY before starting the app.'
fi
