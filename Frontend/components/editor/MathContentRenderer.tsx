// components/editor/MathContentRenderer.tsx
'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathContentRendererProps {
  content: string;
  className?: string;
}

export default function MathContentRenderer({
  content,
  className = '',
}: MathContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Decode HTML entities properly
    const decodeHTML = (html: string) => {
      const txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    };

    // First decode to get proper HTML
    const decodedContent = decodeHTML(content);
    
    // Set the decoded HTML
    containerRef.current.innerHTML = decodedContent;

    // Now find and render math elements
    const mathElements = containerRef.current.querySelectorAll('.math-inline');

    mathElements.forEach((element) => {
      const formula = element.getAttribute('data-formula');
      
      if (formula) {
        try {
          // Clear everything
          element.innerHTML = '';
          
          // Render KaTeX
          katex.render(formula, element as HTMLElement, {
            throwOnError: false,
            displayMode: false,
            trust: true,
          });
        } catch (error) {
          console.error('KaTeX error:', error);
          element.textContent = `[${formula}]`;
        }
      }
    });
  }, [content]);

  if (!content) return null;

  return (
    <div
      ref={containerRef}
      className={`prose prose-sm max-w-none ${className}`}
      style={{ wordBreak: 'break-word' }}
    />
  );
}