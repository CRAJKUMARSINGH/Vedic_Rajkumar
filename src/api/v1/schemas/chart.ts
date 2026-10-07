import { z } from 'zod';

export const BirthInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().default('UTC'),
  name: z.string().max(120).optional(),
});

export const ChartResponse = z.object({
  id: z.string().uuid(),
  lagna: z.object({ sign: z.string(), degree: z.number() }),
  planets: z.array(z.object({
    graha: z.string(),
    sign: z.string(),
    degree: z.number(),
    nakshatra: z.string(),
    pada: z.number(),
    retrograde: z.boolean(),
    house: z.number(),
  })),
  houses: z.array(z.object({ house: z.number(), sign: z.string() })),
});

export const ErrorResponse = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

export type BirthInput = z.infer<typeof BirthInput>;
export type ChartResponse = z.infer<typeof ChartResponse>;
