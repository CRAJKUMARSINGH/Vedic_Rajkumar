import { supabase } from "@/integrations/supabase/client";

export const ingestUrl = async (url: string, category: string, authorName?: string) => {
  const { data, error } = await supabase.functions.invoke('knowledge/ingest-url', {
    body: { url, category, authorName },
  });
  if (error) throw error;
  return data;
};

export const addKnowledgeEntry = async (entry: any) => {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const listKnowledgeEntries = async (category?: string) => {
  let query = supabase.from('knowledge_entries').select('*').order('created_at', { ascending: false });
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const askPrashna = async (payload: { question: string, direction?: string, birthName?: string, questionTime?: string }) => {
  const { data, error } = await supabase.functions.invoke('prashna', {
    body: payload,
  });
  if (error) throw error;
  return data;
};

export const getPrashnaHistory = async (limit = 20) => {
  const { data, error } = await supabase
    .from('prashna_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getKnowledgeStats = async () => {
  const { data, error } = await supabase.from('knowledge_entries').select('category');
  if (error) throw error;
  
  const stats = {
    totalEntries: data.length,
    byCategory: data.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {})
  };
  return stats;
};
