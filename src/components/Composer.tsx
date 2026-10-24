import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUp, Square, Globe, Paperclip, X } from 'lucide-react';
import { ModelOption } from '../types';

interface ComposerProps {
  onSendMessage: (content: string, options: { webSearch: boolean; attachedFile?: string }) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  activeModel: ModelOption;
  initialPrompt?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  activeModel,
  initialPrompt = '',
}) => {
  const [text, setText] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setText(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }
  }, [initialPrompt]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage(trimmed, {
      webSearch: webSearchEnabled,
      attachedFile: attachedFileName || undefined,
    });

    setText('');
    setAttachedFileName(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  return (
    <div className="w-full max-w-[768px] mx-auto px-4 md:px-6 pb-4">
      {/* Attached file preview chip */}
      {attachedFileName && (
        <div className="mb-2 inline-flex items-center gap-2 py-1 px-2.5 rounded-[8px] bg-[#f9f9f9] dark:bg-[#202020] border border-black/10 dark:border-white/10 text-[12px] text-[#0d0d0d] dark:text-[#f0f0f0]">
          <Paperclip className="w-3.5 h-3.5 text-[#5d5d5d] dark:text-[#a3a3a3]" />
          <span className="max-w-[200px] truncate">{attachedFileName}</span>
          <button 
            onClick={() => setAttachedFileName(null)}
            className="hover:text-black dark:hover:text-white p-0.5"
            title="Удалить файл"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div 
        className="relative rounded-[12px] bg-white dark:bg-[#181818] border border-black/15 dark:border-white/10 transition-colors p-3"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Спросите у AMEBA о чем угодно..."
          rows={1}
          className="w-full resize-none bg-transparent text-[15px] leading-[1.5] text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none min-h-[36px] max-h-[200px]"
        />

        {/* Toolbar row */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/6 dark:border-white/6">
          <div className="flex items-center gap-1.5">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Прикрепить файл"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-[8px] text-[12px] transition-all border ${
                webSearchEnabled
                  ? 'bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] border-[#0d0d0d] dark:border-white'
                  : 'bg-transparent text-[#5d5d5d] dark:text-[#a3a3a3] border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d0d0d] dark:hover:text-white'
              }`}
              title="Поиск информации в веб-пространстве"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Поиск</span>
            </button>

            <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-[#8f8f8f] dark:text-[#737373] px-2 py-0.5 rounded-[6px] bg-[#f9f9f9] dark:bg-[#202020]">
              {activeModel.name.replace('AMEBA ', '')}
            </span>
          </div>

          <div>
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="w-8 h-8 rounded-[8px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] flex items-center justify-center hover:bg-black dark:hover:bg-zinc-200 transition-colors"
                title="Остановить генерацию"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim()}
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ${
                  text.trim()
                    ? 'bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] hover:bg-black dark:hover:bg-zinc-200 cursor-pointer'
                    : 'bg-[#f0f0f0] dark:bg-[#252525] text-[#8f8f8f] dark:text-[#555] cursor-not-allowed'
                }`}
                title="Отправить сообщение (Enter)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[12px] text-[#8f8f8f] dark:text-[#737373] mt-2">
        AMEBA может допускать неточности. Проверяйте важные факты и код.
      </p>
    </div>
  );
};
