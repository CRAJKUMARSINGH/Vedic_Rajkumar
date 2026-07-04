
## Rule
Artifact-managed workflows (those created via `createArtifact()`) must use a port from the supported set. Use `restartWorkflow()` from the `code_execution` sandbox — NOT the `restart_workflow` agent tool — to restart them reliably.

**Why:** The `restart_workflow` tool sends SIGTERM then probes the port via the `.replit` [[ports]] table. If the artifact's port isn't in that table (e.g. an auto-assigned port like 25183), detection always times out even when Vite is successfully listening. The `restartWorkflow()` callback uses a different detection path that works for artifact-registered ports.

**How to apply:**
1. If an artifact workflow fails to start with `DIDNT_OPEN_A_PORT`, update `artifact.toml` via `verifyAndReplaceArtifactToml()` to use a port from the supported list: 3000, 3001, 3002, 3003, 4200, 5000, **5173**, 6000, 6800, 8000, 8008, 8080, 8099, 9000.
2. Restart with `restartWorkflow({ workflowName: "...", timeout: 60 })` from `code_execution`, NOT the `restart_workflow` tool.
3. `configureWorkflow()` will be rejected with PROHIBITED_ACTION for artifact-managed workflows — that's expected.
