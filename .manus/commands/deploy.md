# /deploy

Run `pnpm deploy` from the repository root. It runs the typecheck and smoke tests, creates a production build, checks the diff, and pushes `HEAD` to `main`. Render is configured to auto-deploy the `main` branch.
