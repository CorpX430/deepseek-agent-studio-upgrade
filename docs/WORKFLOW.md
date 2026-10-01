# Development workflow

Install the local hook once with `pnpm hooks:install`. The `.githooks/pre-commit` hook runs `pnpm check` before each commit.

The repository's reusable commands are available as package scripts and `.manus/commands` references:

| Command              | Action                                    |
| -------------------- | ----------------------------------------- |
| `pnpm deploy`        | Check, build, diff-check, and push `main` |
| `pnpm check`         | Typecheck and smoke tests                 |
| `pnpm format`        | Format with Prettier                      |
| `pnpm env:setup`     | Create `.env.local` from the template     |
| `pnpm hooks:install` | Enable the pre-commit hook                |

Render auto-deploys the `main` branch after a successful push. The CI workflow file is maintained at `.github/workflows/ci.yml`; publishing it may require GitHub App `workflow` permission.
