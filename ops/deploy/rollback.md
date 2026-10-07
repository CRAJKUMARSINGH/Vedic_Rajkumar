# Rollback Procedure

## Frontend (Netlify/CF Pages)
- Netlify: Deploys → select last-good → "Publish deploy". ~30s.
- CF Pages: Deployments → rollback.

## Edge functions
```bash
git revert <bad-sha> --no-edit
git push
supabase functions deploy <name> --project-ref $REF
```

## Database migration
- Forward-fix preferred. If destructive, restore from backup.
- Always write migrations to be backward-compatible for one release.

## Post-rollback
- Announce in #incidents.
- Tag the release as rolled back in Sentry.
- Open a post-mortem within 24h.
