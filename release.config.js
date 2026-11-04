/**
 * release.config.js — semantic-release. The CHANGELOG is generated, never written.
 *
 * Why: the repo had a version (0.1.0) that had never moved, no CHANGELOG, and no
 * mapping from commit to release. Procurement asks "what changed in 0.4?" — today
 * the answer is "read the git log".
 */
export default {
  branches: [{ name: 'main' }, { name: 'beta', prerelease: true }],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/github', {
      successComment: false,
      // Release notes carry the compliance evidence links — this is what an
      // auditor or a customer's security team actually reads.
      releasedLabels: ['released'],
    }],
    ['@semantic-release/git', {
      assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    }],
  ],
};
