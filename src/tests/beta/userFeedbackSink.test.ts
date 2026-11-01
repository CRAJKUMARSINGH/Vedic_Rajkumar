/**
 * DEF-015 regression — an in-app report must reach the private sink.
 *
 * Before the fix `userFeedbackService.sendToBackend()` was a localStorage mock:
 * the report never left the browser. These tests pin the wiring to the
 * `submit-feedback` edge function and pin the "best effort" contract — a failing
 * sink must never block the tester's submission.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import { supabase } from '@/integrations/supabase/client';
import { userFeedbackService } from '@/services/userFeedbackService';

const invoke = vi.mocked(supabase.functions.invoke);

const report = {
  type: 'bug' as const,
  category: 'accuracy' as const,
  title: 'Rohini pada differs from the reference',
  description: 'Expected pada 2, the app shows pada 3 (synthetic chart).',
  priority: 'high' as const,
  status: 'pending' as const,
  userAgent: 'vitest',
  sessionId: 's1',
  tags: ['beta'],
};

describe('DEF-015 — userFeedbackService private sink', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the report to the submit-feedback edge function', async () => {
    invoke.mockResolvedValue({ data: { id: 'fb_1' }, error: null } as never);

    await userFeedbackService.submitFeedback(report);

    expect(invoke).toHaveBeenCalledTimes(1);
    const [fn, options] = invoke.mock.calls[0];
    expect(fn).toBe('submit-feedback');
    expect(options?.body).toMatchObject({
      category: 'accuracy',
      title: report.title,
      description: report.description,
      sessionId: 's1',
      tags: ['beta'],
    });
  });

  it('does not surface a sink failure to the caller', async () => {
    invoke.mockRejectedValue(new Error('network down'));

    await expect(userFeedbackService.submitFeedback(report)).resolves.toMatchObject({
      title: report.title,
    });
  });
});
