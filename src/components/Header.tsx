import React, { useState, useRef, useEffect } from 'react';
import { ModelOption, AVAILABLE_MODELS, Chat } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronDown, 
  PanelLeft, 
  Share2, 
  Trash2, 
  Plus, 
  Check, 
  CheckCheck,
  Download,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  currentChat: Chat | null;
  onNewChat: () => void;
  onClearCurrentChat: () => void;
  onExportMarkdown: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  activeModel,
  onSelectModel,
  currentChat,
  onNewChat,
  onClearCurrentChat,
  onExportMarkdown,
  onOpenSettings,
}) => {
  const { isDark, theme, setTheme } = useTheme();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const toggleQuickTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="h-[52px] border-b bg-white dark:bg-[#121212] border-black/10 dark:border-white/10 flex items-center justify-between px-3 md:px-4 flex-shrink-0 z-20 transition-colors">
      {/* Left controls: Sidebar toggle & Model Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={isSidebarOpen ? 'Скрыть боковую панель' : 'Показать боковую панель'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-[8px] text-[14px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span>{activeModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5d5d5d] dark:text-[#a3a3a3]" />
          </button>

          {/* Dropdown Menu */}
          {modelDropdownOpen && (
            <div 
              className="absolute left-0 mt-1 w-[290px] rounded-[10px] bg-white dark:bg-[#1a1a1a] border border-black/15 dark:border-white/15 p-1.5 shadow-none z-30 transition-colors"
            >
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8f8f8f] dark:text-[#737373]">
                Модель AMEBA
              </div>
              <div className="space-y-1 mt-1">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-[8px] transition-all flex items-start justify-between ${
                      activeModel.id === model.id 
                        ? 'bg-[#f9f9f9] dark:bg-[#252525]' 
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0]">{model.name}</span>
                        {model.badge && (
                          <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded-none bg-[#f0f0f0] dark:bg-[#333] text-[#5d5d5d] dark:text-[#a3a3a3]">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-0.5 leading-tight">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8f8f8f] dark:text-[#737373]">
                        <span>Контекст: {model.contextWindow}</span>
                        <span>•</span>
                        <span>{model.speed}</span>
                      </div>
                    </div>
                    {activeModel.id === model.id && (
                      <Check className="w-4 h-4 text-[#0d0d0d] dark:text-white mt-0.5 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Title preview (desktop) */}
      <div className="hidden md:flex items-center justify-center flex-1 mx-4 max-w-[400px]">
        {currentChat && (
          <span className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3] truncate font-medium">
            {currentChat.title}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Quick theme toggle */}
        <button
          onClick={toggleQuickTheme}
          className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={isDark ? 'Переключить на светлую тему' : 'Переключить на тему глубокого графита'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick New Chat Button */}
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-[13px]"
          title="Новый диалог (⌘K)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Новый</span>
        </button>

        {/* Export chat as MD */}
        {currentChat && (
          <button
            onClick={onExportMarkdown}
            className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Экспорт в Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Share Link */}
        <button
          onClick={handleShareClick}
          className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
            className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Очистить диалог"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
