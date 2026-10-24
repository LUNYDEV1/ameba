import React, { useState } from 'react';
import { Message } from '../types';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, User as UserIcon } from 'lucide-react';
import { AmebaLogo } from './AmebaLogo';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onRegenerate, 
  isLastAssistant 
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const isUser = message.role === 'user';

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const language = hasLang ? firstLine : 'code';
        const codeText = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <CodeBlock 
            key={index} 
            language={language} 
            code={codeText} 
          />
        );
      }

      return (
        <div key={index} className="space-y-3">
          {part.split('\n\n').map((paragraph, pIdx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Header 3
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-[17px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] mt-4 mb-2">
                  {trimmed.replace(/^###\s+/, '')}
                </h3>
              );
            }

            // Header 2
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={pIdx} className="text-[19px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] mt-5 mb-2">
                  {trimmed.replace(/^##\s+/, '')}
                </h2>
              );
            }

            // Header 1
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={pIdx} className="text-[21px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] mt-5 mb-3">
                  {trimmed.replace(/^#\s+/, '')}
                </h1>
              );
            }

            // Unordered list
            if (trimmed.split('\n').every(l => l.trim().startsWith('* ') || l.trim().startsWith('- '))) {
              const items = trimmed.split('\n').filter(Boolean);
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1.5 my-2 text-[15px] leading-[1.6] text-[#0d0d0d] dark:text-[#f0f0f0]">
                  {items.map((it, itIdx) => (
                    <li key={itIdx}>
                      {renderInlineFormatting(it.replace(/^[\*\-]\s+/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }

            // Numbered list
            if (trimmed.split('\n').every(l => /^\d+\.\s/.test(l.trim()))) {
              const items = trimmed.split('\n').filter(Boolean);
              return (
                <ol key={pIdx} className="list-decimal pl-5 space-y-1.5 my-2 text-[15px] leading-[1.6] text-[#0d0d0d] dark:text-[#f0f0f0]">
                  {items.map((it, itIdx) => (
                    <li key={itIdx}>
                      {renderInlineFormatting(it.replace(/^\d+\.\s+/, ''))}
                    </li>
                  ))}
                </ol>
              );
            }

            // Table detection
            if (trimmed.includes('|') && trimmed.includes('\n|')) {
              return (
                <div key={pIdx} className="overflow-x-auto my-3 rounded-[8px] border border-black/10 dark:border-white/10">
                  <table className="w-full text-[13px] border-collapse text-left">
                    <tbody>
                      {trimmed.split('\n').filter(r => !r.includes(':---') && !r.includes('---:') && !r.includes('---')).map((row, rIdx) => {
                        const cols = row.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                        if (!cols.length) return null;
                        const isHeader = rIdx === 0;
                        return (
                          <tr key={rIdx} className={isHeader ? 'bg-[#f9f9f9] dark:bg-[#202020] font-medium border-b border-black/8 dark:border-white/10' : 'border-b border-black/8 dark:border-white/10 last:border-0'}>
                            {cols.map((col, cIdx) => (
                              <td key={cIdx} className="p-2.5 text-[#0d0d0d] dark:text-[#f0f0f0]">
                                {renderInlineFormatting(col.trim())}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Regular paragraph
            return (
              <p key={pIdx} className="text-[15px] leading-[1.6] text-[#0d0d0d] dark:text-[#f0f0f0] whitespace-pre-wrap">
                {renderInlineFormatting(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return segments.map((seg, i) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code 
            key={i} 
            className="px-1.5 py-0.5 rounded-[4px] bg-[#f9f9f9] dark:bg-[#222] border border-black/10 dark:border-white/10 font-mono text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0]"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">{seg.slice(2, -2)}</strong>;
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return <em key={i} className="italic text-[#0d0d0d] dark:text-[#f0f0f0]">{seg.slice(1, -1)}</em>;
      }
      return seg;
    });
  };

  return (
    <div className="py-4 transition-colors">
      <div className="max-w-[768px] mx-auto px-4 md:px-6">
        <div className="flex gap-4 items-start">
          {/* Avatar Monogram */}
          <div className="flex-shrink-0 mt-0.5">
            {isUser ? (
              <div 
                className="w-7 h-7 rounded-[8px] bg-[#f9f9f9] dark:bg-[#222] border border-black/10 dark:border-white/10 flex items-center justify-center text-[12px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#5d5d5d] dark:text-[#a3a3a3]" />
              </div>
            ) : (
              <div 
                className="w-7 h-7 rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/15 flex items-center justify-center text-[#0d0d0d] dark:text-[#f0f0f0]"
              >
                <AmebaLogo className="w-4 h-4" strokeWidth={1.8} />
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="flex-1 min-w-0">
            {/* Header label */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0]">
                {isUser ? 'Вы' : 'AMEBA'}
              </span>
              <span className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Message Text with Markdown formatting */}
            <div className="text-[#0d0d0d] dark:text-[#f0f0f0] text-[15px] leading-relaxed">
              {renderFormattedContent(message.content)}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#0d0d0d] dark:bg-white animate-pulse align-middle" />
              )}
            </div>

            {/* Action Bar for Assistant Messages */}
            {!isUser && !message.isStreaming && (
              <div className="flex items-center gap-1.5 mt-3 pt-1 text-[#8f8f8f] dark:text-[#737373]">
                <button
                  onClick={handleCopyText}
                  className="p-1.5 rounded-[6px] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-[12px]"
                  title="Скопировать ответ"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white" />
                      <span className="text-[#0d0d0d] dark:text-white">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>

                {isLastAssistant && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-[6px] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-[12px]"
                    title="Сгенерировать заново"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Повторить</span>
                  </button>
                )}

                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                    feedback === 'up' ? 'text-[#0d0d0d] dark:text-white' : 'hover:text-[#0d0d0d] dark:hover:text-white'
                  }`}
                  title="Полезный ответ"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                    feedback === 'down' ? 'text-[#0d0d0d] dark:text-white' : 'hover:text-[#0d0d0d] dark:hover:text-white'
                  }`}
                  title="Неточный ответ"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="my-3 rounded-[8px] bg-[#f9f9f9] dark:bg-[#161616] border border-black/10 dark:border-white/10 overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-black/8 dark:border-white/10 bg-[#f3f3f3] dark:bg-[#202020]">
        <span className="font-mono text-[12px] uppercase text-[#5d5d5d] dark:text-[#a3a3a3] tracking-wider">
          {language}
        </span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white transition-colors py-0.5 px-2 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/5"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#0d0d0d] dark:text-white" />
              <span className="text-[#0d0d0d] dark:text-white font-medium">Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Код</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3.5 overflow-x-auto text-[13px] leading-[1.6] font-mono text-[#0d0d0d] dark:text-[#f0f0f0]">
        <pre className="m-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
