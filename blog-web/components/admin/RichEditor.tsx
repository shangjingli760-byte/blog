'use client';

import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import go from 'highlight.js/lib/languages/go';
import bash from 'highlight.js/lib/languages/bash';

const lowlight = createLowlight();
lowlight.register('javascript', js);
lowlight.register('typescript', ts);
lowlight.register('go', go);
lowlight.register('bash', bash);

/* -------- Markdown 互转 -------- */
function htmlToMarkdown(html: string): string {
  // 临时挂到 DOM 解析
  if (typeof document === 'undefined') return '';
  const div = document.createElement('div');
  div.innerHTML = html;

  function nodeToMd(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(nodeToMd).join('');

    switch (tag) {
      case 'h1': return `# ${inner}\n\n`;
      case 'h2': return `## ${inner}\n\n`;
      case 'h3': return `### ${inner}\n\n`;
      case 'h4': return `#### ${inner}\n\n`;
      case 'p':  return inner ? `${inner}\n\n` : '';
      case 'strong': case 'b': return `**${inner}**`;
      case 'em': case 'i': return `*${inner}*`;
      case 'u':  return `__${inner}__`;
      case 's':  return `~~${inner}~~`;
      case 'code': return el.closest('pre') ? inner : `\`${inner}\``;
      case 'pre': {
        const codeEl = el.querySelector('code');
        const lang = codeEl?.className.match(/language-(\w+)/)?.[1] || '';
        return `\`\`\`${lang}\n${codeEl?.textContent || inner}\n\`\`\`\n\n`;
      }
      case 'blockquote': return inner.split('\n').map(l => l ? `> ${l}` : '>').join('\n') + '\n\n';
      case 'ul': return Array.from(el.children).map(li => `- ${nodeToMd(li).replace(/^[\s\S]*?(?=\S)/, '').trim()}\n`).join('') + '\n';
      case 'ol': return Array.from(el.children).map((li, i) => `${i + 1}. ${nodeToMd(li).replace(/^[\s\S]*?(?=\S)/, '').trim()}\n`).join('') + '\n';
      case 'li': return inner;
      case 'a':  return `[${inner}](${el.getAttribute('href') || ''})`;
      case 'img': return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`;
      case 'hr': return `---\n\n`;
      case 'br': return '\n';
      default:   return inner;
    }
  }

  return Array.from(div.childNodes).map(nodeToMd).join('').replace(/\n{3,}/g, '\n\n').trim();
}

function markdownToHtml(md: string): string {
  if (!md) return '';
  let html = md
    // code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
    // headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // hr
    .replace(/^---$/gm, '<hr>')
    // bold / italic / underline / strike
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // unordered list
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // ordered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // link
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // paragraph (lines not already converted)
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')
    // tidy consecutive blockquotes / li
    .replace(/<\/blockquote>\n<blockquote>/g, '\n')
    .replace(/<\/li>\n<li>/g, '</li><li>');

  // wrap li runs
  html = html.replace(/(<li>[\s\S]*?<\/li>(?:\n<li>[\s\S]*?<\/li>)*)/g, (match) => {
    // detect if originally ordered (numbers) — approximate
    return `<ul>${match}</ul>`;
  });

  return html;
}

/* -------- Toolbar button -------- */
interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}
function ToolbarBtn({ onClick, active, title, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2 py-1 rounded text-sm font-medium transition-all duration-150 select-none ${
        active
          ? 'bg-purple-500/30 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.07]'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="w-px h-5 bg-white/[0.1] mx-1 self-center" />;
}

/* -------- Toolbar -------- */
function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('输入链接 URL', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/[0.08] bg-white/[0.02]">
      {/* 段落/标题 */}
      <select
        className="bg-transparent text-white/60 text-xs rounded px-1 py-0.5 border border-white/[0.08] focus:outline-none hover:border-white/20 cursor-pointer mr-1"
        value={
          editor.isActive('heading', { level: 1 }) ? '1'
          : editor.isActive('heading', { level: 2 }) ? '2'
          : editor.isActive('heading', { level: 3 }) ? '3'
          : editor.isActive('heading', { level: 4 }) ? '4'
          : '0'
        }
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: v as 1|2|3|4 }).run();
        }}
      >
        <option value="0">正文</option>
        <option value="1">标题 1</option>
        <option value="2">标题 2</option>
        <option value="3">标题 3</option>
        <option value="4">标题 4</option>
      </select>

      <ToolbarDivider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="加粗 (Ctrl+B)">
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体 (Ctrl+I)">
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下划线 (Ctrl+U)">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="删除线">
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="行内代码">
        {'</>'}
      </ToolbarBtn>

      <ToolbarDivider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
        ≡
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
        1.
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
        "
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="代码块">
        {'{ }'}
      </ToolbarBtn>

      <ToolbarDivider />

      <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="插入链接">
        🔗
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线">
        —
      </ToolbarBtn>

      <ToolbarDivider />

      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="撤销 (Ctrl+Z)">
        ↩
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="重做 (Ctrl+Y)">
        ↪
      </ToolbarBtn>
    </div>
  );
}

/* -------- Main component -------- */
interface RichEditorProps {
  value: string;       // markdown string
  onChange: (md: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder = '开始写作…' }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[360px] px-4 py-3 focus:outline-none text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(htmlToMarkdown(editor.getHTML()));
    },
  });

  // 当外部 value 变化时（如编辑模式加载文章）同步到编辑器
  useEffect(() => {
    if (!editor) return;
    const currentMd = htmlToMarkdown(editor.getHTML());
    if (currentMd !== value) {
      editor.commands.setContent(markdownToHtml(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] overflow-hidden focus-within:border-purple-500/50 focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.12)] transition-all duration-200">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror code {
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.85em;
          color: #7dd3fc;
        }
        .ProseMirror pre {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: #e2e8f0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid rgba(168,85,247,0.5);
          padding-left: 12px;
          color: rgba(255,255,255,0.4);
          margin: 8px 0;
        }
        .ProseMirror a {
          color: #a78bfa;
          text-decoration: underline;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
}
