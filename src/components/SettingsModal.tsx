import React, { useState } from 'react';
import { X, Download, Trash2, Check, Sliders, Shield, Terminal, Sun, Moon, Monitor } from 'lucide-react';
import { Chat } from '../types';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSaveSystemPrompt: (prompt: string) => void;
  creativityMode: 'precise' | 'balanced' | 'creative';
  onChangeCreativityMode: (mode: 'precise' | 'balanced' | 'creative') => void;
  chats: Chat[];
  onClearAllChats: () => void;
  currentChatTitle?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSaveSystemPrompt,
  creativityMode,
  onChangeCreativityMode,
  chats,
  onClearAllChats,
  currentChatTitle,
}) => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'system' | 'data'>('general');
  const [promptText, setPromptText] = useState(systemPrompt);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleSavePrompt = () => {
    onSaveSystemPrompt(promptText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const exportAllChatsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chats, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `ameba_chats_export_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const themeOptions: Array<{ id: ThemeMode; label: string; desc: string; icon: React.ReactNode }> = [
    {
      id: 'light',
      label: 'Светлая',
      desc: 'Graphite on paper',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      id: 'dark',
      label: 'Темная',
      desc: 'Глубокий графит',
      icon: <Moon className="w-4 h-4" />,
    },
    {
      id: 'system',
      label: 'Системная',
      desc: 'Как в ОС',
      icon: <Monitor className="w-4 h-4" />,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 transition-colors"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-[520px] rounded-[10px] bg-white dark:bg-[#181818] p-6 border text-[#0d0d0d] dark:text-[#f0f0f0] max-h-[90vh] flex flex-col border-black/10 dark:border-white/10 transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-[18px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">Параметры AMEBA</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 my-4 p-1 rounded-[10px] bg-[#f9f9f9] dark:bg-[#121212] border border-black/8 dark:border-white/10">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-1.5 px-3 text-[13px] font-medium rounded-[8px] transition-all ${
              activeTab === 'general' 
                ? 'bg-white dark:bg-[#202020] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0]' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            Общие
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1.5 px-3 text-[13px] font-medium rounded-[8px] transition-all ${
              activeTab === 'system' 
                ? 'bg-white dark:bg-[#202020] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0]' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            Инструкции
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-1.5 px-3 text-[13px] font-medium rounded-[8px] transition-all ${
              activeTab === 'data' 
                ? 'bg-white dark:bg-[#202020] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0]' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            Управление данными
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-4 py-1 pr-1">
          {activeTab === 'general' && (
            <div className="space-y-4 text-[14px]">
              {/* Theme Switcher Row */}
              <div>
                <label className="block text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1.5">
                  Тема оформления
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`p-3 text-left rounded-[10px] border transition-all flex flex-col justify-between ${
                        theme === opt.id
                          ? 'border-[#0d0d0d] dark:border-white bg-[#f9f9f9] dark:bg-[#242424]'
                          : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1e] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[#0d0d0d] dark:text-[#f0f0f0]">
                          {opt.icon}
                        </div>
                        {theme === opt.id && (
                          <Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0]">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[#8f8f8f] dark:text-[#a3a3a3] mt-0.5 leading-tight">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Creativity Mode */}
              <div>
                <label className="block text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1.5">
                  Характер ответов (Температура модели)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'precise', label: 'Точный', desc: 'Детерминированный, строгий' },
                    { id: 'balanced', label: 'Сбалансированный', desc: 'Оптимально для диалога' },
                    { id: 'creative', label: 'Творческий', desc: 'Развернутый и гибкий' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onChangeCreativityMode(m.id as any)}
                      className={`p-3 text-left rounded-[10px] border transition-all ${
                        creativityMode === m.id
                          ? 'border-[#0d0d0d] dark:border-white bg-[#f9f9f9] dark:bg-[#242424]'
                          : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1e] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="font-medium text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0]">{m.label}</div>
                      <div className="text-[11px] text-[#8f8f8f] dark:text-[#a3a3a3] mt-0.5 leading-tight">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design System Details */}
              <div className="p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10">
                <div className="font-medium text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0] mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Философия глубокого графита</span>
                </div>
                <p className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3] leading-[1.45]">
                  В темном режиме интерфейс переходит в палитру глубокого графита (`#121212` холст, `#171717` боковая панель). Полное отсутствие пестроты, контрастные линии в 1px и нулевая утомляемость глаз при ночной работе.
                </p>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10 text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                <div className="font-medium text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0] mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Безопасность сессий</span>
                </div>
                <p className="leading-[1.45]">
                  Сессии и сообщения привязаны к вашей учетной записи Firebase и защищены матрицей прав доступа Firestore.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">
                  Пользовательские инструкции (System Prompt)
                </label>
                <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mb-2 leading-tight">
                  Задайте формат, стиль общения или правила, которым модель должна следовать во всех диалогах.
                </p>
                <textarea
                  rows={5}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Например: Отвечай на русском языке строго по существу, формулируй выводы списком и всегда комментируй примеры кода..."
                  className="w-full p-3 text-[13px] rounded-[10px] bg-white dark:bg-[#1e1e1e] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none focus:border-[#0d0d0d] dark:focus:border-white leading-relaxed resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[12px] text-[#8f8f8f] dark:text-[#a3a3a3]">
                  {savedSuccess ? '✓ Изменения успешно сохранены' : 'Применяется ко всем новым запросам'}
                </span>
                <button
                  onClick={handleSavePrompt}
                  className="px-4 py-2 rounded-[10px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[13px] font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Сохранить</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4 text-[13px]">
              {/* Export */}
              <div className="p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10">
                <div className="font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">Экспорт истории</div>
                <p className="text-[#5d5d5d] dark:text-[#a3a3a3] mb-3 leading-snug">
                  Сохраните все ваши диалоги ({chats.length}) в стандартном структурированном формате JSON.
                </p>
                <button
                  onClick={exportAllChatsJson}
                  className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-[#252525] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] text-[13px] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать JSON архив</span>
                </button>
              </div>

              {/* Clear History */}
              <div className="p-3.5 rounded-[10px] bg-[#f9f9f9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10">
                <div className="font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">Очистить историю</div>
                <p className="text-[#5d5d5d] dark:text-[#a3a3a3] mb-3 leading-snug">
                  Удалит все локальные сохраненные чаты и сообщения на этом устройстве.
                </p>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClearAllChats();
                        setConfirmClear(false);
                      }}
                      className="px-3 py-1.5 rounded-[8px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[12px] font-medium hover:bg-black dark:hover:bg-zinc-200"
                    >
                      Да, удалить все чаты
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-[8px] text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-[#252525] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] text-[13px] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Очистить историю</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-black/10 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[13px] font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
