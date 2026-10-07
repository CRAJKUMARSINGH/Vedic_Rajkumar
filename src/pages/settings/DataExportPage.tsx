import React, { useState } from 'react';

interface DataExportPageProps {
  getToken?: () => Promise<string | null>;
}

/**
 * Data Export Page
 * Week 5: GDPR Article 20 / India DPDP Act self-service data portability.
 */
export const DataExportPage: React.FC<DataExportPageProps> = ({ getToken }) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getToken ? await getToken() : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const endpoint = supabaseUrl
        ? `${supabaseUrl}/functions/v1/export-user-data`
        : '/functions/v1/export-user-data';

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        throw new Error(`Export failed: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      downloadBlob(blob, `vedic-rajkumar-export-${Date.now()}.json`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Export Your Data</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your right to data portability under GDPR Article 20 and India DPDP Act 2023.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm">
            Download a complete copy of all your personal data, birth charts, family profiles, and
            consultation history in JSON format.
          </p>

          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>All birth charts and profiles</li>
            <li>Consultation notes and recommendations</li>
            <li>Account activity (last 90 days)</li>
            <li>Export metadata and checksum</li>
          </ul>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-700 bg-green-50 rounded p-2">
              ✓ Export downloaded successfully.
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full mt-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium disabled:opacity-50 transition"
          >
            {exporting ? 'Preparing export…' : 'Download My Data (JSON)'}
          </button>

          <p className="text-xs text-muted-foreground">
            Data deletion requests: email{' '}
            <a href="mailto:privacy@vedic-rajkumar.com" className="underline">
              privacy@vedic-rajkumar.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataExportPage;
