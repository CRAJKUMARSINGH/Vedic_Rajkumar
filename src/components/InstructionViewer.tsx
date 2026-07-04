import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const InstructionViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml] = useState<string>('Loading...');

  useEffect(() => {
    if (!id) {
      setHtml('<p>No instruction selected.</p>');
      return;
    }

    let cancelled = false;

    const fetchMd = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}instructions/${encodeURIComponent(id)}.md`);
        if (!res.ok) throw new Error('Not found');
        const md = await res.text();
        if (!cancelled) {
          setHtml(DOMPurify.sanitize(marked.parse(md)));
        }
      } catch {
        if (!cancelled) {
          setHtml('<p>Failed to load content.</p>');
        }
      }
    };

    void fetchMd();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div
      className="prose prose-slate max-w-4xl mx-auto p-4 dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default InstructionViewer;
