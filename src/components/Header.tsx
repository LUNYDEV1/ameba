import React, { useState } from 'react';
import { Chat } from '../types';
import { 
  PanelLeft, 
  Share2, 
  Trash2, 
  Plus, 
  CheckCheck,
  Download
} from 'lucide-react';
import { AmebaLogo } from './AmebaLogo';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentChat: Chat | null;
  onNewChat: () => void;
  onClearCurrentChat: () => void;
  onExportMarkdown: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  currentChat,
  onNewChat,
  onClearCurrentChat,
  onExportMarkdown,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <header className="h-[52px] border-b bg-white dark:bg-[#121212] border-black/10 dark:border-white/10 flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-20 transition-colors">
      {/* Left controls: Sidebar toggle & AMEBA Brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
          title={isSidebarOpen ? 'Скрыть боковую панель' : 'Показать боковую панель'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {!isSidebarOpen && (
          <div className="flex items-center gap-2 pl-1 animate-fade-in">
            <AmebaLogo className="w-4 h-4 text-[#0d0d0d] dark:text-[#f0f0f0]" strokeWidth={1.8} />
            <span className="font-semibold text-[14px] tracking-tight text-[#0d0d0d] dark:text-[#f0f0f0]">
              AMEBA
            </span>
          </div>
        )}
      </div>

      {/* Middle: Title preview */}
      <div className="hidden md:flex items-center justify-center flex-1 mx-4 max-w-[400px]">
        {currentChat && (
          <span className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3] truncate font-medium">
            {currentChat.title}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Export chat as MD */}
        {currentChat && (
          <button
            onClick={onExportMarkdown}
            className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            title="Экспорт в Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Share Link */}
        <button
          onClick={handleShareClick}
          className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
          title="Поделиться диалогом"
        >
          {copiedLink ? (
            <CheckCheck className="w-4 h-4 text-[#0d0d0d] dark:text-white" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        {/* Clear Messages */}
        {currentChat && (
          <button
            onClick={onClearCurrentChat}
            className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            title="Очистить диалог"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
