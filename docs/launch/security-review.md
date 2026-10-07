# Pre-Launch Security Review

## Checklist
- [ ] All RLS policies reviewed; default-deny confirmed
- [ ] Service role key never exposed client-side
- [ ] Security headers live (CSP, HSTS, X-Frame)
- [ ] API keys hashed at rest; plaintext shown once
- [ ] Webhook signatures verified
- [ ] Rate limiting active on all public endpoints
- [ ] Idempotency on all mutating endpoints
- [ ] Dependency audit clean: `npm audit --production`
- [ ] No secrets in git: `git grep -iE 'sk_|service_role'`
- [ ] PII redaction in logs verified
- [ ] CORS locked to known origins
- [ ] Auth: MFA available, sessions expire, refresh rotation on
- [ ] Backups encrypted at rest

## Run
```bash
npm audit --production
npx license-checker --production --summary
```
