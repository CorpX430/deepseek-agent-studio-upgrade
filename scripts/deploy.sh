#!/bin/sh
set -eu
pnpm check
pnpm build
git diff --check
git push origin HEAD:main
printf '%s\n' 'Pushed successfully; Render auto-deploy will publish main.'
