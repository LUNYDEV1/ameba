import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Check, 
  Sun, 
  Moon, 
  Monitor, 
  FileText, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  FileCheck, 
  Settings, 
  Zap, 
  Database, 
  ChevronDown, 
  ChevronUp,
  Shield
} from 'lucide-react';
import { Chat } from '../types';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLimits } from '../context/LimitContext';

export type SettingsTab = 'settings' | 'tariffs' | 'data' | 'legal';
export type LegacySettingsTab = 'general' | 'system' | 'tariffs' | 'data' | 'ai-legal' | 'payment-legal' | SettingsTab;

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
  initialTab?: LegacySettingsTab;
}

function normalizeTab(tab?: LegacySettingsTab): SettingsTab {
  if (!tab) return 'settings';
  if (tab === 'general' || tab === 'system' || tab === 'settings') return 'settings';
  if (tab === 'tariffs') return 'tariffs';
  if (tab === 'data') return 'data';
  if (tab === 'ai-legal' || tab === 'payment-legal' || tab === 'legal') return 'legal';
  return 'settings';
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
  initialTab = 'settings',
}) => {
  const { theme, setTheme } = useTheme();
  const { tariff, setTariff, usedTokens, maxTokens, percentUsed, percentRemaining, formatTokens, timeUntilReset } = useLimits();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => normalizeTab(initialTab));
  const [promptText, setPromptText] = useState(systemPrompt);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [tariffSuccess, setTariffSuccess] = useState<string | null>(null);

  // Accordion state for legal documents: key of open item or null
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(normalizeTab(initialTab));
      setPromptText(systemPrompt);
    }
  }, [isOpen, initialTab, systemPrompt]);

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

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => prev === id ? null : id);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 transition-colors animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-[760px] rounded-[14px] bg-white dark:bg-[#181818] p-6 border text-[#0d0d0d] dark:text-[#f0f0f0] max-h-[90vh] flex flex-col border-black/10 dark:border-white/10 transition-colors animate-scale-in shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <h2 className="text-[18px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">Параметры AMEBA</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simplified 4 Top-Level Tabs Navigation with Uniform Lucide Icons */}
        <div className="grid grid-cols-4 gap-1.5 my-4 p-1 rounded-[10px] bg-[#f4f4f5] dark:bg-[#121212] border border-black/8 dark:border-white/10 flex-shrink-0 text-[13px]">
          {/* Tab 1: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-2 text-center font-medium rounded-[8px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings' 
                ? 'bg-white dark:bg-[#222225] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] shadow-sm font-semibold' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Настройки</span>
          </button>

          {/* Tab 2: Tariffs */}
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`py-2 px-2 text-center font-medium rounded-[8px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tariffs' 
                ? 'bg-white dark:bg-[#222225] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] shadow-sm font-semibold' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span>Тарифы</span>
          </button>

          {/* Tab 3: Data */}
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-2 text-center font-medium rounded-[8px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'data' 
                ? 'bg-white dark:bg-[#222225] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] shadow-sm font-semibold' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            <Database className="w-4 h-4 flex-shrink-0" />
            <span>Данные</span>
          </button>

          {/* Tab 4: Legal / Documents */}
          <button
            onClick={() => setActiveTab('legal')}
            className={`py-2 px-2 text-center font-medium rounded-[8px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'legal' 
                ? 'bg-white dark:bg-[#222225] border border-black/10 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] shadow-sm font-semibold' 
                : 'text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-[#f0f0f0]'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>Документы</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto space-y-4 py-1 pr-1 min-h-[340px]">
          
          {/* TAB 1: COMBINED SETTINGS (APPEARANCE + SYSTEM PROMPT) */}
          {activeTab === 'settings' && (
            <div key="settings" className="space-y-6 text-[14px] animate-tab-switch">
              {/* Theme Picker */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] mb-2">
                  Тема оформления
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`p-3 rounded-[10px] text-left transition-all border flex flex-col gap-1.5 ${
                        theme === opt.id
                          ? 'bg-white dark:bg-[#222] border-[#0d0d0d] dark:border-white text-[#0d0d0d] dark:text-white shadow-sm'
                          : 'bg-[#f9f9f9] dark:bg-[#141414] border-black/10 dark:border-white/10 text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {opt.icon}
                        {theme === opt.id && <Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white" />}
                      </div>
                      <div className="font-semibold text-[13px]">{opt.label}</div>
                      <div className="text-[11px] text-[#8f8f8f] dark:text-[#737373] leading-none">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Style */}
              <div className="pt-4 border-t border-black/8 dark:border-white/8">
                <label className="block text-[13px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">
                  Стиль генерации и точности
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { id: 'precise', label: 'Точный', desc: 'Строгий анализ и код' },
                    { id: 'balanced', label: 'Баланс', desc: 'Стандартный ответ' },
                    { id: 'creative', label: 'Творческий', desc: 'Идеи и генерация' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onChangeCreativityMode(m.id as any)}
                      className={`p-2.5 rounded-[8px] border text-left transition-all ${
                        creativityMode === m.id
                          ? 'bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] border-[#0d0d0d] dark:border-white font-medium'
                          : 'bg-white dark:bg-[#141414] border-black/10 dark:border-white/10 text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white'
                      }`}
                    >
                      <div className="text-[12px] font-semibold">{m.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Prompt Section */}
              <div className="pt-4 border-t border-black/8 dark:border-white/8 space-y-2">
                <label className="block text-[13px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
                  Инструкции для ИИ (System Prompt)
                </label>
                <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] leading-relaxed">
                  Персонализируйте стиль работы AMEBA AI. Укажите желаемый язык программирования, роли или формат ответов.
                </p>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Например: Отвечай лаконично, используй TypeScript и комментируй сложные моменты кода..."
                  className="w-full p-3 text-[13px] font-mono rounded-[10px] bg-[#f9f9f9] dark:bg-[#121212] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none focus:border-[#0d0d0d] dark:focus:border-white transition-colors"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setPromptText('')}
                    className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-red-500 transition-colors"
                  >
                    Сбросить инструкции
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePrompt}
                    className="px-4 py-2 rounded-[8px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[13px] font-semibold hover:bg-black dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Сохранено!</span>
                      </>
                    ) : (
                      <span>Сохранить настройки</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TARIFFS & LIMITS */}
          {activeTab === 'tariffs' && (
            <div key="tariffs" className="space-y-4 text-[#2d2d2d] dark:text-[#d4d4d4] animate-tab-switch">
              <div className="pb-1 border-b border-black/8 dark:border-white/8 flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#0d0d0d] dark:text-[#f0f0f0]">
                    Тарифные планы и лимиты токенов
                  </h3>
                  <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-0.5">
                    Выберите подходящий тариф для увеличения объёма общения в 10 или 20 раз
                  </p>
                </div>
              </div>

              {/* Success Notification Banner */}
              {tariffSuccess && (
                <div className="p-3 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[13px] font-medium flex items-center justify-between animate-scale-in">
                  <span>{tariffSuccess}</span>
                  <button onClick={() => setTariffSuccess(null)} className="text-[11px] underline">ОК</button>
                </div>
              )}

              {/* Current Token Usage Card */}
              <div className="p-3.5 rounded-[12px] bg-[#f9f9f9] dark:bg-[#141414] border border-black/10 dark:border-white/10 text-[13px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">Текущий расчётный период</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d]">
                    {tariff.toUpperCase()} ({tariff === 'free' ? 'Базовый' : tariff === 'super' ? 'x10' : 'x20'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mb-1.5">
                  <span>Использовано: {formatTokens(usedTokens)} из {formatTokens(maxTokens)} токенов</span>
                  <span>Осталось: {percentRemaining}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      percentRemaining === 0 ? 'bg-red-500' : percentRemaining <= 20 ? 'bg-amber-500' : 'bg-[#0d0d0d] dark:bg-white'
                    }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8f8f8f] dark:text-[#737373] pt-1 border-t border-black/5 dark:border-white/5">
                  <span>Восстановление: ежедневно в 08:00 МСК (через {timeUntilReset})</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Синхронизировано на всех устройствах</span>
                </div>
              </div>

              {/* 3 Tariff Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* 1. FREE TARIFF */}
                <div className={`p-4 rounded-[12px] border flex flex-col justify-between transition-all ${
                  tariff === 'free'
                    ? 'bg-white dark:bg-[#181818] border-2 border-[#0d0d0d] dark:border-white shadow-md'
                    : 'bg-[#f9f9f9] dark:bg-[#141414] border-black/10 dark:border-white/10'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[15px] text-[#0d0d0d] dark:text-white">БЕСПЛАТНЫЙ</span>
                      {tariff === 'free' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d]">
                          ТЕКУЩИЙ
                        </span>
                      )}
                    </div>
                    <div className="text-[20px] font-bold text-[#0d0d0d] dark:text-white my-1">
                      0 ₽ <span className="text-[11px] font-normal text-[#8f8f8f]">/ месяц</span>
                    </div>
                    <div className="text-[11px] font-medium text-[#0d0d0d] dark:text-white mb-2">
                      50 000 токенов
                    </div>
                    <ul className="space-y-1.5 text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> Хватает на ~30-40 мин общения</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> Примерно 1 целый проект</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> Стандартная скорость AMEBA</li>
                    </ul>
                  </div>

                  <button
                    onClick={async () => {
                      await setTariff('free');
                      setTariffSuccess('Переключено на Бесплатный тариф');
                    }}
                    disabled={tariff === 'free'}
                    className={`w-full mt-4 py-2 px-3 rounded-[8px] text-[12px] font-semibold transition-all ${
                      tariff === 'free'
                        ? 'bg-black/5 dark:bg-white/5 text-[#8f8f8f] cursor-default'
                        : 'bg-white dark:bg-[#202020] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tariff === 'free' ? 'Текущий тариф' : 'Выбрать бесплатный'}
                  </button>
                </div>

                {/* 2. SUPER TARIFF (499 RUB) */}
                <div className={`p-4 rounded-[12px] border flex flex-col justify-between transition-all relative ${
                  tariff === 'super'
                    ? 'bg-white dark:bg-[#181818] border-2 border-[#0d0d0d] dark:border-white shadow-md'
                    : 'bg-white dark:bg-[#161616] border-black/15 dark:border-white/15 hover:border-black/30'
                }`}>
                  <div className="absolute -top-2.5 right-3 bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    x10 Лимиты
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[15px] text-[#0d0d0d] dark:text-white">SUPER</span>
                      {tariff === 'super' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d]">
                          ТЕКУЩИЙ
                        </span>
                      )}
                    </div>
                    <div className="text-[20px] font-bold text-[#0d0d0d] dark:text-white my-1">
                      499 ₽ <span className="text-[11px] font-normal text-[#8f8f8f]">/ месяц</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#0d0d0d] dark:text-white mb-2">
                      500 000 токенов (х10)
                    </div>
                    <ul className="space-y-1.5 text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> ~6 часов непрерывного общения</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> 10 сложных проектов и приложений</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> Приоритетная скорость обработки</li>
                    </ul>
                  </div>

                  <button
                    onClick={async () => {
                      await setTariff('super');
                      setTariffSuccess('Тариф SUPER (499 ₽/мес, x10 лимиты) успешно активирован!');
                    }}
                    disabled={tariff === 'super'}
                    className={`w-full mt-4 py-2 px-3 rounded-[8px] text-[12px] font-semibold transition-all ${
                      tariff === 'super'
                        ? 'bg-black/5 dark:bg-white/5 text-[#8f8f8f] cursor-default'
                        : 'bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] hover:bg-black dark:hover:bg-zinc-200 shadow-sm'
                    }`}
                  >
                    {tariff === 'super' ? 'Текущий тариф' : 'Подключить SUPER за 499 ₽/мес'}
                  </button>
                </div>

                {/* 3. ULTIMA TARIFF (899 RUB) */}
                <div className={`p-4 rounded-[12px] border flex flex-col justify-between transition-all relative ${
                  tariff === 'ultima'
                    ? 'bg-white dark:bg-[#181818] border-2 border-[#0d0d0d] dark:border-white shadow-md'
                    : 'bg-white dark:bg-[#161616] border-black/15 dark:border-white/15 hover:border-black/30'
                }`}>
                  <div className="absolute -top-2.5 right-3 bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    x20 Лимиты
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[15px] text-[#0d0d0d] dark:text-white">ULTIMA</span>
                      {tariff === 'ultima' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d]">
                          ТЕКУЩИЙ
                        </span>
                      )}
                    </div>
                    <div className="text-[20px] font-bold text-[#0d0d0d] dark:text-white my-1">
                      899 ₽ <span className="text-[11px] font-normal text-[#8f8f8f]">/ месяц</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#0d0d0d] dark:text-white mb-2">
                      1 000 000 токенов (х20)
                    </div>
                    <ul className="space-y-1.5 text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> ~13 часов общения без паузы</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> 20+ коммерческих проектов</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-white flex-shrink-0 mt-0.5" /> Максимальный приоритет и глубокий разбор</li>
                    </ul>
                  </div>

                  <button
                    onClick={async () => {
                      await setTariff('ultima');
                      setTariffSuccess('Тариф ULTIMA (899 ₽/мес, x20 лимиты) успешно активирован!');
                    }}
                    disabled={tariff === 'ultima'}
                    className={`w-full mt-4 py-2 px-3 rounded-[8px] text-[12px] font-semibold transition-all ${
                      tariff === 'ultima'
                        ? 'bg-black/5 dark:bg-white/5 text-[#8f8f8f] cursor-default'
                        : 'bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] hover:bg-black dark:hover:bg-zinc-200 shadow-sm'
                    }`}
                  >
                    {tariff === 'ultima' ? 'Текущий тариф' : 'Подключить ULTIMA за 899 ₽/мес'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                <strong>Оплата и безопасность:</strong> Транзакции обрабатываются через защищённый платёжный шлюз с поддержкой карт МИР, СБП и Visa/Mastercard. Данные зашифрованы по стандарту PCI DSS.
              </div>
            </div>
          )}

          {/* TAB 3: DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div key="data" className="space-y-4 animate-tab-switch">
              <div className="p-4 rounded-[10px] bg-[#f9f9f9] dark:bg-[#141414] border border-black/10 dark:border-white/10">
                <h3 className="text-[13px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">
                  Экспорт локальных данных
                </h3>
                <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mb-3">
                  Скачайте резервную копию всех ваших диалогов и историй в формате JSON.
                </p>
                <button
                  onClick={exportAllChatsJson}
                  className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-[#252525] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] text-[13px] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Экспортировать всё в JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-[10px] bg-red-500/5 border border-red-500/20">
                <h3 className="text-[13px] font-semibold text-red-600 dark:text-red-400 mb-1">
                  Очистка всей истории
                </h3>
                <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mb-3">
                  Бесповоротно удалит все созданные диалоги и сообщения с вашего устройства.
                </p>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClearAllChats();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-[8px] bg-red-600 text-white text-[12px] font-medium hover:bg-red-700"
                    >
                      Да, полностью очистить
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
                    className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-[#252525] border border-red-500/30 text-red-600 dark:text-red-400 text-[13px] font-medium hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Удалить все диалоги</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONSOLIDATED LEGAL ACCORDION ("ДОКУМЕНТЫ") */}
          {activeTab === 'legal' && (
            <div key="legal" className="space-y-3 text-[#2d2d2d] dark:text-[#d4d4d4] animate-tab-switch pr-1">
              <div className="pb-1 border-b border-black/8 dark:border-white/8">
                <h3 className="text-[15px] font-bold text-[#0d0d0d] dark:text-[#f0f0f0]">
                  Правовая информация и правила сервиса
                </h3>
                <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-0.5">
                  Нажмите на любой раздел, чтобы ознакомиться с кратким резюме или полным текстом документа
                </p>
              </div>

              {/* ACCORDION ITEM 1: PRIVACY POLICY */}
              <div className="border border-black/10 dark:border-white/10 rounded-[12px] overflow-hidden bg-[#fdfdfd] dark:bg-[#151515] transition-all">
                {/* Header */}
                <div 
                  onClick={() => toggleAccordion('privacy')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/3 dark:hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-black/5 dark:bg-white/5 text-[#0d0d0d] dark:text-white">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px] text-[#0d0d0d] dark:text-[#f0f0f0]">
                        Политика конфиденциальности
                      </h4>
                      <p className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">
                        Правила сбора и защиты персональных данных
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#5d5d5d] dark:text-[#a3a3a3]">
                      {openAccordion === 'privacy' ? 'Свернуть' : 'Подробнее'}
                    </span>
                    {openAccordion === 'privacy' ? (
                      <ChevronUp className="w-4 h-4 text-[#8f8f8f]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8f8f8f]" />
                    )}
                  </div>
                </div>

                {/* Body */}
                {openAccordion === 'privacy' && (
                  <div className="px-4 pb-4 pt-1 border-t border-black/8 dark:border-white/8 space-y-3 animate-fade-in text-[12.5px]">
                    {/* Summary Card */}
                    <div className="p-3 rounded-[8px] bg-black/4 dark:bg-white/5 border border-black/6 dark:border-white/6 leading-relaxed">
                      <div className="font-semibold text-[#0d0d0d] dark:text-white mb-1">Коротко о вашей приватности:</div>
                      <ul className="list-disc pl-4 space-y-1 text-[#5d5d5d] dark:text-[#c0c0c0]">
                        <li>Обрабатываются только необходимые данные для авторизации, подписок и работы диалогов.</li>
                        <li>Данные не продаются и не передаются третьим лицам.</li>
                        <li>Реквизиты банковских карт не хранятся на наших серверах — оплата идет через защищённый шлюз.</li>
                        <li>Вы вправе в любой момент запросить полное удаление ваших данных.</li>
                      </ul>
                    </div>

                    {/* Verbatim Full Text */}
                    <div className="space-y-3 pt-2 leading-relaxed text-[#3d3d3d] dark:text-[#ccc]">
                      <div className="font-bold text-[#0d0d0d] dark:text-white">Полный текст документа:</div>
                      
                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">1. Общие положения</div>
                        <p>1.1. Настоящая Политика конфиденциальности определяет порядок обработки и защиты информации о пользователях сервиса AMEBA AI.</p>
                        <p>1.2. Обработка персональных данных осуществляется в соответствии с применимым законодательством.</p>
                        <p>1.3. Используя Сервис, Пользователь подтверждает ознакомление с настоящей Политикой.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">2. Обрабатываемые данные</div>
                        <p>2.1. В зависимости от функционала Оператор обрабатывает: имя, адрес электронной почты, сведения об аккаунте и подписках, технические данные устройства и историю обращений в поддержку.</p>
                        <p>2.2. Оператор не запрашивает и не хранит пароли в открытом виде и платежные реквизиты карт.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">3. Цели обработки</div>
                        <p>Предоставление сервиса ИИ, обработка подписок, оказание поддержки, обеспечение безопасности и выполнение требований законодательства.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">4. Передача данных и защита</div>
                        <p>Оператор не продает персональные данные. Передача платёжным и техническим партнерам осуществляется исключительно в объеме, необходимом для работы сервиса. Все соединения защищены шифрованием.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">5. Права пользователя и контакты</div>
                        <p>Пользователь имеет право на доступ, изменение и удаление своих данных. По всем вопросам обращаться в поддержку: Telegram @hcoder0, Email altaicoder@gmail.com.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDION ITEM 2: PUBLIC OFFER / TERMS */}
              <div className="border border-black/10 dark:border-white/10 rounded-[12px] overflow-hidden bg-[#fdfdfd] dark:bg-[#151515] transition-all">
                {/* Header */}
                <div 
                  onClick={() => toggleAccordion('terms')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/3 dark:hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-black/5 dark:bg-white/5 text-[#0d0d0d] dark:text-white">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px] text-[#0d0d0d] dark:text-[#f0f0f0]">
                        Публичная оферта
                      </h4>
                      <p className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">
                        Условия предоставления услуг, оплаты и подписок
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#5d5d5d] dark:text-[#a3a3a3]">
                      {openAccordion === 'terms' ? 'Свернуть' : 'Подробнее'}
                    </span>
                    {openAccordion === 'terms' ? (
                      <ChevronUp className="w-4 h-4 text-[#8f8f8f]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8f8f8f]" />
                    )}
                  </div>
                </div>

                {/* Body */}
                {openAccordion === 'terms' && (
                  <div className="px-4 pb-4 pt-1 border-t border-black/8 dark:border-white/8 space-y-3 animate-fade-in text-[12.5px]">
                    {/* Summary Card */}
                    <div className="p-3 rounded-[8px] bg-black/4 dark:bg-white/5 border border-black/6 dark:border-white/6 leading-relaxed">
                      <div className="font-semibold text-[#0d0d0d] dark:text-white mb-1">Коротко об условиях оферты:</div>
                      <ul className="list-disc pl-4 space-y-1 text-[#5d5d5d] dark:text-[#c0c0c0]">
                        <li>Официальный публичный договор оказания услуг и предоставления токенов AMEBA AI.</li>
                        <li>Доступ к опциям и увеличенным лимитам активируется сразу после проведения оплаты.</li>
                        <li>Оплата совершается в рублях через сертифицированные российские платежные системы.</li>
                        <li>Техническая поддержка оперативно решает любые вопросы с подпиской или сбоями.</li>
                      </ul>
                    </div>

                    {/* Verbatim Full Text */}
                    <div className="space-y-3 pt-2 leading-relaxed text-[#3d3d3d] dark:text-[#ccc]">
                      <div className="font-bold text-[#0d0d0d] dark:text-white">Полный текст оферты:</div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">1. Общие положения</div>
                        <p>1.1. Настоящий документ — официальная публичная оферта о предоставлении доступа к нейросетевому сервису AMEBA AI.</p>
                        <p>1.2. Оплата тарифа или использование Сервиса является полным и безоговорочным акцептом данной оферты.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">2. Порядок оказания услуг</div>
                        <p>2.1. Доступ к дополнительным токенам и возможностям предоставляется в соответствии с выбранным тарифом (SUPER, ULTIMA).</p>
                        <p>2.2. Пользователь самостоятельно обеспечивает наличие интернет-соединения и устройства для работы с сервисом.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">3. Оплата и возвраты</div>
                        <p>3.1. Цены указаны в интерфейсе Сервиса. При сбоях или непредставлении услуги поддержка рассматривает обращения о восстановлении доступа или возврате средств.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">4. Обязанности сторон</div>
                        <p>Пользователь обязуется использовать сервис в законных целях. Исполнитель обеспечивает техническое функционирование платформы.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDION ITEM 3: DATA & CODE GUARANTEES (FORMER AI REGLAMENT) */}
              <div className="border border-black/10 dark:border-white/10 rounded-[12px] overflow-hidden bg-[#fdfdfd] dark:bg-[#151515] transition-all">
                {/* Header */}
                <div 
                  onClick={() => toggleAccordion('ai-guarantees')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/3 dark:hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-black/5 dark:bg-white/5 text-[#0d0d0d] dark:text-white">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px] text-[#0d0d0d] dark:text-[#f0f0f0]">
                        Гарантии по данным и коду
                      </h4>
                      <p className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">
                        Защита промптов, неиспользование для обучения и 100% права на код
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#5d5d5d] dark:text-[#a3a3a3]">
                      {openAccordion === 'ai-guarantees' ? 'Свернуть' : 'Подробнее'}
                    </span>
                    {openAccordion === 'ai-guarantees' ? (
                      <ChevronUp className="w-4 h-4 text-[#8f8f8f]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8f8f8f]" />
                    )}
                  </div>
                </div>

                {/* Body */}
                {openAccordion === 'ai-guarantees' && (
                  <div className="px-4 pb-4 pt-1 border-t border-black/8 dark:border-white/8 space-y-3 animate-fade-in text-[12.5px]">
                    {/* Summary Card */}
                    <div className="p-3 rounded-[8px] bg-black/4 dark:bg-white/5 border border-black/6 dark:border-white/6 leading-relaxed">
                      <div className="font-semibold text-[#0d0d0d] dark:text-white mb-1">Главное о защите вашего контента:</div>
                      <ul className="list-disc pl-4 space-y-1 text-[#5d5d5d] dark:text-[#c0c0c0]">
                        <li>Ваши диалоги, системные инструкции и файлы не используются для обучения сторонних моделей.</li>
                        <li>Весь сгенерированный программой код и контент на 100% принадлежит вам. Вы можете свободно использовать его в коммерческих целях.</li>
                        <li>Соединения шифруются, а доступ к данным изолирован на уровне вашей учётной записи.</li>
                      </ul>
                    </div>

                    {/* Detailed Clean Text */}
                    <div className="space-y-3 pt-2 leading-relaxed text-[#3d3d3d] dark:text-[#ccc]">
                      <div className="font-bold text-[#0d0d0d] dark:text-white">Подробные положения регламента:</div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">1. Неиспользование данных для обучения сторонних моделей</div>
                        <p>Все личные сообщения, исходный код и вложения обрабатываются строго в рамках рабочей сессии. Платформа AMEBA не передает пользовательские промпты для дообучения публичных базовых нейросетей.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">2. Интеллектуальная собственность на код</div>
                        <p>Все результаты генерации, включая программный код (TypeScript, Python, C#, SQL и др.), тексты и структуры данных, принадлежат Пользователю. Вы имеете право коммерциализировать, продавать и публиковать код без выплат роялти.</p>
                      </div>

                      <div>
                        <div className="font-semibold text-[#0d0d0d] dark:text-white">3. Изоляция и безопасность сессий</div>
                        <p>Соединения защищены шифрованием, а хранение историй диалогов строго привязано к вашей учетной записи.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDION ITEM 4: CONTACTS AND SUPPORT */}
              <div className="border border-black/10 dark:border-white/10 rounded-[12px] overflow-hidden bg-[#fdfdfd] dark:bg-[#151515] transition-all">
                {/* Header */}
                <div 
                  onClick={() => toggleAccordion('support')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/3 dark:hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-black/5 dark:bg-white/5 text-[#0d0d0d] dark:text-white">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px] text-[#0d0d0d] dark:text-[#f0f0f0]">
                        Контакты и служба поддержки
                      </h4>
                      <p className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">
                        Официальные каналы связи для вопросов и помощи
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#5d5d5d] dark:text-[#a3a3a3]">
                      {openAccordion === 'support' ? 'Свернуть' : 'Подробнее'}
                    </span>
                    {openAccordion === 'support' ? (
                      <ChevronUp className="w-4 h-4 text-[#8f8f8f]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8f8f8f]" />
                    )}
                  </div>
                </div>

                {/* Body */}
                {openAccordion === 'support' && (
                  <div className="px-4 pb-4 pt-1 border-t border-black/8 dark:border-white/8 space-y-3 animate-fade-in text-[12.5px]">
                    {/* Summary Card */}
                    <div className="p-3 rounded-[8px] bg-black/4 dark:bg-white/5 border border-black/6 dark:border-white/6 leading-relaxed">
                      <div className="font-semibold text-[#0d0d0d] dark:text-white mb-1">Служба поддержки AMEBA:</div>
                      <p className="text-[#5d5d5d] dark:text-[#c0c0c0]">
                        По вопросам работы платформы, оплате подписок, возвратам или юридическим запросам обращайтесь по официальным контактам:
                      </p>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <a
                        href="https://t.me/hcoder0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-[10px] bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all flex items-start gap-3 group"
                      >
                        <div className="p-2 rounded-[8px] bg-black/5 dark:bg-white/5 text-[#0d0d0d] dark:text-white">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">Telegram поддержка</div>
                          <div className="font-semibold text-[13.5px] text-[#0d0d0d] dark:text-white group-hover:underline">@hcoder0</div>
                          <div className="text-[10.5px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-0.5">Оперативная помощь (5-30 минут)</div>
                        </div>
                      </a>

                      <a
                        href="mailto:altaicoder@gmail.com"
                        className="p-3 rounded-[10px] bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all flex items-start gap-3 group"
                      >
                        <div className="p-2 rounded-[8px] bg-black/5 dark:bg-white/5 text-[#0d0d0d] dark:text-white">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[#8f8f8f] dark:text-[#737373]">Официальный Email</div>
                          <div className="font-semibold text-[13.5px] text-[#0d0d0d] dark:text-white group-hover:underline">altaicoder@gmail.com</div>
                          <div className="text-[10.5px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-0.5">Официальные и юридические обращения</div>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer - Simple, clean Close button as requested */}
        <div className="pt-3.5 mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-[8px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[13px] font-semibold hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
