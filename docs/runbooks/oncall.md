# On-Call & Escalation

## Rotation
- Primary: 1 week, Mon→Mon
- Secondary: backup, same week
- Handoff: written summary in #oncall

## Severity
| Sev | Definition | Ack | Escalate |
|-----|-----------|-----|----------|
| SEV1 | Full outage / data loss | 5 min | Immediate, all-hands |
| SEV2 | Major feature down | 15 min | Primary→Secondary |
| SEV3 | Degraded / minor | 1h | Ticket |

## Escalation path
Primary → Secondary → Engineering lead → Founder

## First 5 minutes (SEV1)
1. Acknowledge in #incidents
2. Check status page + Sentry + health endpoint
3. Roll back last deploy if within 30 min
4. Post updates every 15 min
5. Preserve logs before they age out

## Post-incident
Blameless post-mortem within 48h. Actions tracked to closure.
