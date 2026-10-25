import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'security';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'security'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 transition-colors animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-[680px] max-h-[85vh] flex flex-col rounded-[12px] bg-white dark:bg-[#181818] border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors animate-scale-in shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#181818]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0d0d0d] dark:text-white" />
            <h2 className="text-[17px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
              Юридические документы и Политики AMEBA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-black/8 dark:border-white/8 px-6 bg-[#f9f9f9] dark:bg-[#141414] text-[13px] font-medium">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-[#0d0d0d] dark:border-white text-[#0d0d0d] dark:text-white font-semibold'
                : 'border-transparent text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Конфиденциальность</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-[#0d0d0d] dark:border-white text-[#0d0d0d] dark:text-white font-semibold'
                : 'border-transparent text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Условия использования</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#0d0d0d] dark:border-white text-[#0d0d0d] dark:text-white font-semibold'
                : 'border-transparent text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Безопасность данных</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[13.5px] leading-relaxed text-[#2d2d2d] dark:text-[#d4d4d4]">
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-[16px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
                Политика конфиденциальности AMEBA AI
              </h3>
              <p className="text-[12px] text-[#8f8f8f] dark:text-[#737373]">
                Дата последнего обновления: 25 октября 2026 года
              </p>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">1. Сбор и обработка информации</h4>
                <p>
                  Сервис AMEBA уважает приватность пользователей. Мы обрабатываем только те данные, которые необходимы для аутентификации, генерации ответов искусственного интеллекта и синхронизации истории чатов:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Данные учетной записи:</strong> Email, отображаемое имя и аватар профиля, предоставляемые через Google OAuth или Firebase Auth.</li>
                  <li><strong>Содержимое диалогов:</strong> Тексты сообщений и запросов пользователей для передачи в AMEBA API и сохранения в персонализированной базе данных Firestore.</li>
                  <li><strong>Технические данные:</strong> Валидация защиты от спама через сервис Yandex SmartCaptcha без передачи персональных биометрических сведений.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">2. Использование данных ИИ-моделями</h4>
                <p>
                  Ваши диалоги передаются через защищенные зашифрованные соединения (HTTPS/TLS) в AMEBA AI Gateway исключительно для генерации ответов в реальном времени. Ваши личные диалоги **не используются для публичного обучения базовых нейросетей**.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">3. Хранение и удаление данных</h4>
                <p>
                  Пользователь имеет право в любой момент полностью очистить историю своих диалогов или удалить профиль. При удалении история стирается как из локального хранилища браузера (`localStorage`), так и из облака Firebase Firestore.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-[16px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
                Пользовательское соглашение (Terms of Service)
              </h3>
              <p className="text-[12px] text-[#8f8f8f] dark:text-[#737373]">
                Дата вступления в силу: 25 октября 2026 года
              </p>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">1. Правила использования сервиса</h4>
                <p>
                  Пользователь обязуется использовать AMEBA AI в соответствии с законодательством. Запрещается использовать сервис для генерации вредоносного кода, спама, нелегального контента или попыток обхода систем защиты.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">2. Отказ от гарантий и ответственность</h4>
                <p>
                  Ответы генеративной модели AMEBA носят информационный характер. Сервис предоставляет ответы «как есть» (As Is). Пользователь самостоятельно проверяет факты и код, особенно при принятии финансовых, юридических или медицинских решений.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">3. Интеллектуальная собственность</h4>
                <p>
                  Все права на созданный пользователем с помощью ИИ контент (код, тексты, аналитика) принадлежат пользователю.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-[16px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
                Политика безопасности и защиты данных
              </h3>
              <p className="text-[12px] text-[#8f8f8f] dark:text-[#737373]">
                Стандарты безопасности AMEBA Architecture
              </p>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">1. Шифрование и протоколы</h4>
                <p>
                  Все передаваемые данные между браузером, сервером и облачной базой Firestore зашифрованы с использованием протокола TLS 1.3 с высокой стойкостью шифрования.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">2. Строгое ограничение доступа (RBAC & Security Rules)</h4>
                <p>
                  База данных Firebase Firestore защищена правилами доступа `firestore.rules`. Никакой пользователь не имеет физической или программной возможности прочитать диалоги других пользователей.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">3. Защита от ботов и брутфорса</h4>
                <p>
                  Вход в систему защищен интерактивным сервисом Yandex SmartCaptcha, блокирующим автоматизированный спам, перебор паролей и DDOS-атаки.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 bg-[#f9f9f9] dark:bg-[#141414] flex items-center justify-between text-[12px] text-[#8f8f8f] dark:text-[#737373]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0d0d0d] dark:text-white" />
            <span>Официальный юридический регламент AMEBA AI</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[8px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] font-medium text-[13px] hover:bg-black dark:hover:bg-zinc-200 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
