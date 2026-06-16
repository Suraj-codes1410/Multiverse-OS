'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split by double line breaks to identify structural blocks
  const blocks = content.split(/\n\n+/);

  const renderInline = (text: string) => {
    // Regex matches inline code `code`, bold **bold**, and link [label](url)
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    const tokens = text.split(regex);

    return tokens.map((token, tidx) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={tidx} className="bg-bg-primary px-1.5 py-0.5 rounded font-mono text-[11px] text-accent-cyan border border-border-subtle/50">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={tidx} className="font-bold text-text-primary">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('[') && token.includes('](')) {
        const match = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          return (
            <a
              key={tidx}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline inline-flex items-center gap-0.5"
            >
              {match[1]}
            </a>
          );
        }
      }
      return token;
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs text-text-secondary leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code block check
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const lang = lines[0].slice(3).trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <pre key={idx} className="bg-bg-primary border border-border-subtle p-4 rounded-lg font-mono text-xs text-text-primary overflow-x-auto my-3 select-all">
              {lang && <div className="text-[10px] text-text-secondary uppercase mb-2 select-none border-b border-border-subtle/30 pb-1">{lang}</div>}
              <code>{code}</code>
            </pre>
          );
        }

        // Headings check
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const text = match[2];
            const headingStyles = [
              'text-xl font-bold border-b border-border-subtle pb-2 mb-3 mt-4 text-text-primary', // h1
              'text-lg font-bold border-b border-border-subtle/60 pb-1 mb-2.5 mt-3.5 text-text-primary', // h2
              'text-base font-bold mb-2 mt-3 text-text-primary', // h3
              'text-sm font-bold mb-2 mt-2.5 text-text-primary', // h4
              'text-xs font-bold mb-1.5 mt-2 text-text-primary', // h5
              'text-xs font-bold uppercase mb-1.5 mt-2 text-text-secondary', // h6
            ];
            const style = headingStyles[level - 1] || headingStyles[5];
            return React.createElement(`h${level}`, { key: idx, className: style }, renderInline(text));
          }
        }

        // List items check
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s+/)) {
          const lines = trimmed.split('\n');
          const items = lines.map((line, lidx) => {
            const itemText = line.replace(/^[-*\s]+|^\d+\.\s+/, '');
            return (
              <li key={lidx} className="list-disc ml-5 mb-1 text-xs text-text-secondary leading-relaxed">
                {renderInline(itemText)}
              </li>
            );
          });
          return <ul key={idx} className="my-2.5 space-y-1">{items}</ul>;
        }

        // Standard Paragraph
        const lines = trimmed.split('\n');
        return (
          <p key={idx} className="text-xs text-text-secondary leading-relaxed my-2">
            {lines.map((line, lidx) => (
              <React.Fragment key={lidx}>
                {lidx > 0 && <br />}
                {renderInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
