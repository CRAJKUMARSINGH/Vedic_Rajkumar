import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownViewer: React.FC = () => {
  const { '*': slug } = useParams(); // catches the rest of the path
  const [content, setContent] = useState<string>('Loading...');
  const documentPath = useMemo(() => {
    if (!slug) return null;
    return slug
      .split('/')
      .filter(Boolean)
      .map(part => encodeURIComponent(part))
      .join('/');
  }, [slug]);

  useEffect(() => {
    if (!documentPath) {
      setContent('<p>No supplement document selected.</p>');
      return;
    }

    let cancelled = false;

    const fetchMarkdown = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}supplements/${documentPath}.md`);
        if (!response.ok) {
          throw new Error(`Document not found (${response.status})`);
        }
        const text = await response.text();
        const html = marked.parse(text);
        if (!cancelled) {
          setContent(DOMPurify.sanitize(html));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load content.';
          setContent(`<p>${DOMPurify.sanitize(message)}</p>`);
        }
      }
    };
    fetchMarkdown();
    return () => {
      cancelled = true;
    };
  }, [documentPath]);

  return (
    <main className="mx-auto max-w-4xl p-4">
      <Link to="/supplements" className="mb-4 inline-flex text-sm font-semibold text-primary">
        Back to supplements
      </Link>
      <article
        className="prose prose-slate max-w-none rounded-lg border bg-card p-5 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
};

export default MarkdownViewer;
