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
    if (!containerRef.current) return;

    // Set the HTML content
    containerRef.current.innerHTML = content;

    // Find and render all math formulas
    const mathElements = containerRef.current.querySelectorAll('.math-inline');
    
    mathElements.forEach((element) => {
      const formula = element.getAttribute('data-value') || 
                     element.textContent?.replace(/^\$|\$$/g, '') || '';
      
      try {
        katex.render(formula, element as HTMLElement, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        element.textContent = `$${formula}$`;
      }
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-sm max-w-none ${className}`}
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
}

// Add this to your global CSS file (globals.css or app.css)
/*
.prose strong {
  font-weight: 700 !important;
  color: inherit;
}

.prose em {
  font-style: italic !important;
  color: inherit;
}

.prose u {
  text-decoration: underline !important;
  color: inherit;
}

.prose p {
  margin: 0.5em 0;
}

.prose ul,
.prose ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.25em 0;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  font-weight: 600;
  margin: 0.75em 0 0.5em 0;
  color: inherit;
}
*/