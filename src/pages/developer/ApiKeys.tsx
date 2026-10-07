/**
 * Developer API Keys Page — Week 11
 * Allows users to generate, view, and revoke API keys.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  tier: string;
  rate_limit_per_day: number;
  usage_count: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const ApiKeysPage = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('api_keys')
      .select('id, name, key_prefix, tier, rate_limit_per_day, usage_count, last_used_at, is_active, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setKeys(data as ApiKey[]);
    }
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      // Generate a random key client-side for display (never stored in plain)
      const rawKey = `vr_${Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`;

      const prefix = rawKey.slice(0, 10);

      // Hash the key before storing
      const msgBuffer = new TextEncoder().encode(rawKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const keyHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('api_keys').insert({
        name: newKeyName.trim(),
        key_hash: keyHash,
        key_prefix: prefix,
        tier: 'free',
        rate_limit_per_day: 100,
      });

      if (!error) {
        setGeneratedKey(rawKey); // Show once to user
        setNewKeyName('');
        await loadKeys();
      }
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('api_keys').update({ is_active: false }).eq('id', id);
    await loadKeys();
  };

  const maskKey = (prefix: string) => `${prefix}${'•'.repeat(32)}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Developer API</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Use API keys to authenticate requests to the Vedic Rajkumar API.
        Free tier: 100 requests/day. Keys are shown only once.
      </p>

      {/* Generate new key */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Key name (e.g. My App)"
          className="flex-1 border rounded px-3 py-2 text-sm"
          id="api-key-name-input"
        />
        <button
          id="generate-api-key-btn"
          onClick={generateKey}
          disabled={loading || !newKeyName.trim()}
          className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate New Key'}
        </button>
      </div>

      {/* Show generated key once */}
      {generatedKey && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
          <p className="text-sm font-medium text-green-800 mb-1">
            ⚠️ Copy your key now — it won't be shown again.
          </p>
          <code className="text-xs break-all bg-white border rounded p-2 block">{generatedKey}</code>
          <button
            id="dismiss-key-btn"
            onClick={() => setGeneratedKey(null)}
            className="mt-2 text-xs text-green-600 underline"
          >
            I've copied it — dismiss
          </button>
        </div>
      )}

      {/* Keys table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Key</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-right px-4 py-3">Usage</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {keys.map((key) => (
              <tr key={key.id} className={key.is_active ? '' : 'opacity-40'}>
                <td className="px-4 py-3 font-medium">{key.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {maskKey(key.key_prefix)}
                </td>
                <td className="px-4 py-3 capitalize">{key.tier}</td>
                <td className="px-4 py-3 text-right">
                  {key.usage_count} / {key.rate_limit_per_day} today
                </td>
                <td className="px-4 py-3 text-right">
                  {key.is_active ? (
                    <button
                      id={`revoke-key-${key.id}`}
                      onClick={() => revokeKey(key.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Revoked</span>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No API keys yet. Generate one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiKeysPage;
