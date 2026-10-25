import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { BirthInput, ChartResponse } from './schemas/chart';
import { AnswerCardSchema, AnswerQuery } from './schemas/answer';

const registry = new OpenAPIRegistry();
registry.registerComponent('securitySchemes', 'ApiKey', {
  type: 'http', scheme: 'bearer', description: 'API key (vk_live_… / vk_test_…)',
});

registry.registerPath({
  method: 'post', path: '/v1/charts',
  summary: 'Create a natal chart',
  security: [{ ApiKey: [] }],
  request: { body: { content: { 'application/json': { schema: BirthInput } } } },
  responses: {
    201: { description: 'Created', content: { 'application/json': { schema: ChartResponse } } },
    422: { description: 'Validation error' },
    429: { description: 'Rate limited' },
  },
});

registry.registerPath({
  method: 'get', path: '/v1/answer',
  summary: 'Get a precomputed answer card (verdict-first)',
  description: 'Returns the deterministic verdict for a person in the seed bank. Reply from direct_answer; do not recompute.',
  security: [{ ApiKey: [] }],
  request: { query: AnswerQuery },
  responses: {
    200: { description: 'Answer card', content: { 'application/json': { schema: AnswerCardSchema } } },
    403: { description: 'Missing answers:read scope' },
    422: { description: 'Validation error' },
    429: { description: 'Rate limited' },
  },
});

export const generateOpenApi = () => new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.0',
  info: { title: 'Vedic Rajkumar API', version: '1.0.0', description: 'Public astrology engine API' },
  servers: [{ url: 'https://api.vedic-rajkumar.app' }],
});
