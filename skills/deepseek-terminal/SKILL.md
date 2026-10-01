# DeepSeek Terminal skill

Use this skill when the user asks DeepSeek Agent Studio to build, inspect, or verify code.

## Operating rules

1. State the intended change briefly before using tools.
2. Use the E2B sandbox tools only through the server-side `/api/agent` route.
3. Prefer `list_files` and `read_file` before editing existing code.
4. Use `write_file` for complete files and `run_terminal_command` for deterministic checks.
5. Never expose API keys, private wallet material, or host credentials in tool output.
6. Run tests and a production build before claiming completion.
7. Summarize changed files, checks, and any remaining configuration needed.

## Available tools

- `run_terminal_command`: execute a bounded command in the isolated E2B sandbox.
- `write_file`: write complete file contents.
- `read_file`: inspect a file.
- `list_files`: inspect a sandbox directory.
