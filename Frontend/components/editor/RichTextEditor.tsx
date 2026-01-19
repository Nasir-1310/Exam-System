// components/editor/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useState } from "react";
import "katex/dist/katex.min.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "লিখুন...",
  minHeight = "150px",
}: RichTextEditorProps) {
  const [showMathInput, setShowMathInput] = useState(false);
  const [mathFormula, setMathFormula] = useState("");

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const insertMathFormula = () => {
    if (mathFormula.trim()) {
      // Insert math using KaTeX-style delimiters
      editor
        .chain()
        .focus()
        .insertContent(`<span class="math-inline">$${mathFormula}$</span>`)
        .run();
      setMathFormula("");
      setShowMathInput(false);
    }
  };

  return (
    <div className=" tiptap-editor border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("bold") ? "bg-blue-100 text-blue-700" : "bg-white"
            }`}
            title="Bold (Ctrl+B)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("italic")
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Italic (Ctrl+I)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("underline")
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Underline (Ctrl+U)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("strike")
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Strikethrough"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
            </svg>
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 transition ${
              editor.isActive("heading", { level: 1 })
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 transition ${
              editor.isActive("heading", { level: 2 })
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 transition ${
              editor.isActive("heading", { level: 3 })
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("bulletList")
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("orderedList")
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
            </svg>
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive({ textAlign: "left" })
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Align Left"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive({ textAlign: "center" })
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Align Center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive({ textAlign: "right" })
                ? "bg-blue-100 text-blue-700"
                : "bg-white"
            }`}
            title="Align Right"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
            </svg>
          </button>
        </div>

        {/* Math Formula */}
        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => setShowMathInput(!showMathInput)}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              showMathInput ? "bg-blue-100 text-blue-700" : "bg-white"
            }`}
            title="Insert Math Formula"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.5 13c-.83 0-1.5-.67-1.5-1.5h-2c0 .83-.67 1.5-1.5 1.5S7 15.33 7 14.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 9h-5V7h5v2z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            className="p-2 rounded bg-white hover:bg-gray-200 transition"
            title="Clear Formatting"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Math Formula Input */}
      {showMathInput && (
        <div className="border-b border-gray-300 bg-blue-50 p-3">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={mathFormula}
              onChange={(e) => setMathFormula(e.target.value)}
              placeholder="LaTeX formula (e.g., x^2 + y^2 = r^2)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyPress={(e) => e.key === "Enter" && insertMathFormula()}
            />
            <button
              type="button"
              onClick={insertMathFormula}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              যোগ করুন
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMathInput(false);
                setMathFormula("");
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
            >
              বাতিল
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <p className="font-medium mb-1">উদাহরণ:</p>
            <div className="grid grid-cols-2 gap-2">
              <code className="bg-white px-2 py-1 rounded">x^2</code>
              <code className="bg-white px-2 py-1 rounded">
                \frac{"{a}{b}"}
              </code>
              <code className="bg-white px-2 py-1 rounded">\sqrt{"{x}"}</code>
              <code className="bg-white px-2 py-1 rounded">\alpha, \beta</code>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className="prosemirror-content" />

      {/* Character Count (Optional) */}
      <div className="border-t border-gray-200 px-3 py-1 bg-gray-50">
        <p className="text-xs text-gray-500">
          {editor.storage.characterCount?.characters() || 0} অক্ষর
        </p>
      </div>
    </div>
  );
}
