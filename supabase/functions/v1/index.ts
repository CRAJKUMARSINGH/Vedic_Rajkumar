/**
 * /functions/v1/* — mounts the previously ORPHANED src/api/v1 Hono router.
 *
 * Before this file, hono was a production dependency, docs/api/openapi.yaml,
 * packages/sdk-ts and docs/API_MONETIZATION_STRATEGY.md all described a public
 * API, and there was no server. This is the server.
 *
 * Import order matters: the shim must run before any src/ module is evaluated.
 */
import '../_shared/viteEnvShim.ts';

import { handle } from 'https://esm.sh/hono@4.13.13/deno';
import { app } from '../../../src/api/v1/router.ts';

Deno.serve(handle(app));
