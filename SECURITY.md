# Security Implementation Documentation

## Overview

This document describes the security implementation for the Vedic_Rajkumar application, focusing on Row Level Security (RLS) policies, data isolation, user privacy features, and data management operations.

## Authentication & Authorization

### Identity Provider
- **Primary**: Clerk (JWT-based authentication)
- **Fallback**: Supabase Auth (for compatibility)
- **User ID Resolution**: Uses `COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub')` to support both providers

### Authentication Flow
1. User authenticates via Clerk
2. Clerk generates JWT with user ID in `sub` claim
3. JWT is forwarded to Supabase in Authorization header
4. Supabase RLS policies validate JWT claims against data ownership

## Data Model & Security

### Personal Data Tables

All personal data tables follow the owner-scoped pattern:

| Table | Owner Column | RLS Policy Pattern |
|-------|-------------|-------------------|
| `saved_readings` | `user_id` | User ID must match JWT `sub` |
| `user_profiles` | `id` | Primary key must match JWT `sub` |
| `transit_readings` | `owner_id` | Owner ID must match JWT `sub` |
| `prashna_sessions` | `owner_id` | Owner ID must match JWT `sub` |
| `horoscope_analyses` | `owner_id` | Owner ID must match JWT `sub` |

### Public Data Tables

| Table | Access Pattern | RLS Policy |
|-------|---------------|------------|
| `knowledge_entries` | Public read, authenticated write | SELECT: all users, INSERT/UPDATE/DELETE: authenticated only |

### System Tables

| Table | Access Pattern | RLS Policy |
|-------|---------------|------------|
| `rate_limit_log` | Service role only | All operations: service_role only |

## Row Level Security (RLS) Policies

### Policy Pattern

All personal data tables use the same RLS policy pattern:

```sql
-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- INSERT policy
CREATE POLICY "table_name_authenticated_insert"
  ON public.table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_column = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- SELECT policy
CREATE POLICY "table_name_authenticated_select"
  ON public.table_name
  FOR SELECT
  TO authenticated
  USING (owner_column = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- UPDATE policy
CREATE POLICY "table_name_authenticated_update"
  ON public.table_name
  FOR UPDATE
  TO authenticated
  USING (owner_column = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  WITH CHECK (owner_column = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));

-- DELETE policy
CREATE POLICY "table_name_authenticated_delete"
  ON public.table_name
  FOR DELETE
  TO authenticated
  USING (owner_column = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'));
```

### Security Assumptions

1. **JWT Validation**: Supabase validates JWT signatures and expiration
2. **User ID Consistency**: Clerk user IDs (`user_*`) are used consistently across all tables
3. **No Anonymous Access**: Personal data tables have no anonymous access policies
4. **Service Role Isolation**: Service role key is only used in edge functions for rate limiting
5. **RLS Enforcement**: All database access goes through RLS-enforced clients

## Data Privacy Features

### Export Functionality

**Endpoint**: `user-data-export` edge function  
**Method**: GET  
**Rate Limit**: 5 requests per user per hour  
**Authentication**: Required (valid Clerk JWT)

**Exported Data**:
- User profile settings
- Saved readings (`saved_readings`)
- Transit readings (`transit_readings`)
- Prashna sessions (`prashna_sessions`)
- Horoscope analyses (`horoscope_analyses`)

**Implementation**:
- Uses user-scoped Supabase client (respects RLS)
- Parallel data fetching for performance
- Returns JSON with Content-Disposition for file download
- Server-side rate limiting via `rate_limit_log` table

### Delete Functionality

**Endpoint**: `user-data-delete` edge function  
**Method**: DELETE  
**Rate Limit**: 3 requests per user per day  
**Authentication**: Required (valid Clerk JWT)  
**Confirmation**: Required (`{ confirm: true }` in body or `?confirm=true` query param)

**Deleted Data**:
- All saved readings
- All transit readings
- All prashna sessions
- All horoscope analyses
- User profile

**Safety Features**:
- Explicit confirmation required
- Rate limiting prevents accidental mass deletion
- Idempotent (safe to call multiple times)
- Returns deletion counts for audit trail

## Rate Limiting

### Implementation

- **Table**: `rate_limit_log`
- **Fields**: `user_id`, `endpoint`, `requested_at`
- **Cleanup**: Entries older than 48 hours via `cleanup_rate_limit_log()` function

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `user-data-export` | 5 requests | 1 hour |
| `user-data-delete` | 3 requests | 24 hours |

### Client-Side Rate Limiting

Additional client-side rate limiting using token bucket algorithm:
- Implemented in `@/lib/rateLimiter`
- Applied before server calls for early rejection
- Configurable capacity and refill rate

## Input Sanitization

### Sanitization Utilities

All user inputs are sanitized before database insertion:

```typescript
import { sanitizeText, sanitizeHtml, sanitizeObject } from '@/lib/sanitize';
```

**Functions**:
- `sanitizeText()`: Strips HTML tags, trims whitespace
- `sanitizeHtml()`: Allows safe formatting tags only
- `sanitizeObject()`: Recursively sanitizes all string values

**Applied To**:
- Reading titles and notes
- Birth location strings
- Profile display names
- Question text in prashna sessions
- Analysis text in horoscope analyses

## Security Testing

### Test Coverage

Comprehensive test suite in `src/tests/week3/`:

- **security.test.ts**: Sanitization and rate limiting utilities
- **dataLayer.test.ts**: Data layer service functions
- **dataExportService.test.ts**: Export functionality
- **dataDeleteService.test.ts**: Delete functionality
- **useUserDataPrivacy.test.ts**: Privacy hook

### Running Tests

```bash
npm test -- src/tests/week3/
```

**Current Status**: All 59 tests passing

## Migration History

### Week 3 Security Migrations

1. **20260902170000_secure_sensitive_readings_rls.sql**
   - Added `owner_id` columns to sensitive tables
   - Implemented owner-scoped RLS policies
   - Dropped public access policies

2. **20260904090000_week3_security_data_layer.sql**
   - Created `saved_readings` table with RLS
   - Created `user_profiles` table with RLS
   - Created `rate_limit_log` table
   - Implemented comprehensive RLS policies

3. **20260905120000_week3_anon_read_lockdown.sql**
   - Removed any remaining anonymous read policies
   - Ensured RLS enabled on all personal tables
   - Added `cleanup_rate_limit_log()` function

4. **20260905130000_week3_comprehensive_rls_enhancement.sql**
   - Standardized RLS policies across all tables
   - Added missing policies for complete CRUD coverage
   - Added documentation comments on tables
   - Included verification query

## Security Best Practices

### Implemented

✅ **Principle of Least Privilege**: Users can only access their own data  
✅ **Defense in Depth**: Client-side + server-side rate limiting  
✅ **Input Validation**: All user inputs sanitized  
✅ **Audit Trail**: Rate limit logging for monitoring  
✅ **Safe Defaults**: RLS enabled by default, no anonymous access  
✅ **Explicit Confirmation**: Destructive operations require confirmation  
✅ **Comprehensive Testing**: Full test coverage for security features  

### Future Enhancements

- [ ] Add audit logging for data access
- [ ] Implement data retention policies
- [ ] Add encryption for sensitive fields
- [ ] Implement session timeout handling
- [ ] Add security headers to edge functions
- [ ] Implement CSRF protection for state-changing operations

## Troubleshooting

### Common Issues

**Issue**: RLS policy denies access  
**Solution**: Verify JWT `sub` claim matches owner column in database

**Issue**: Rate limit exceeded  
**Solution**: Wait for window to expire or use service role for admin operations

**Issue**: Export returns empty data  
**Solution**: Verify user has data in database and JWT is valid

**Issue**: Delete confirmation fails  
**Solution**: Ensure `{ confirm: true }` is sent in request body

## Security Contact

For security concerns or vulnerabilities, please follow the project's security disclosure policy.

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk Authentication](https://clerk.com/docs)
- [OWASP Security Guidelines](https://owasp.org/)
