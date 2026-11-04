/**
 * commitlint.config.js — .js (not .cjs) on purpose: flat-config resolution order
 * bit us once already (see docs/DUPLICATES.md), and the same class of bug applies
 * to any loader that prefers one extension.
 *
 * The commit type drives semantic-release, so this is release machinery, not style.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2, 'always',
      [
        'tier', 'billing', 'api', 'ratelimit', 'observability', 'erasure',
        'compliance', 'perf', 'i18n', 'dr', 'governance', 'release',
        'ephemeris', 'ui', 'a11y', 'docs', 'ci', 'deps', 'security',
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [2, 'always', 100],
    // A body is required on breaking changes so the CHANGELOG is readable.
    'body-min-length': [1, 'always', 20],
  },
  // Release commits and Dependabot must not be blocked.
  ignores: [
    (msg) => msg.startsWith('chore(release)'),
    (msg) => /^Merge /.test(msg),
    (msg) => /^Revert /.test(msg),
  ],
};
