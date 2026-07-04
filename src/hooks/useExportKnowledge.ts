/**
 * useExportKnowledge
 * Fetches the compiled knowledge-base markdown from the API.
 * Falls back gracefully when the API is unavailable (static deploy).
 */
import { useQuery } from '@tanstack/react-query';

export interface KnowledgeExportData {
  markdown: string;
  cardCount: number;
}

async function fetchExportKnowledge(): Promise<KnowledgeExportData> {
  const res = await fetch('/api/knowledge/export');
  if (!res.ok) {
    return { markdown: '', cardCount: 0 };
  }
  return res.json() as Promise<KnowledgeExportData>;
}

export function useExportKnowledge() {
  return useQuery<KnowledgeExportData, Error>({
    queryKey: ['knowledge-export'],
    queryFn: fetchExportKnowledge,
    retry: false,
    throwOnError: false,
  });
}
