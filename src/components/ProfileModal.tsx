import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, Edit2, ShieldCheck, Mail, KeyRound } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, logout, updateDisplayName } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || userProfile?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateDisplayName(nameInput.trim());
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const providerName = user.providerData[0]?.providerId === 'google.com' 
    ? 'Google Аутентификация' 
    : 'Электронная почта и пароль';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 transition-colors"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-[440px] rounded-[10px] bg-white dark:bg-[#181818] p-6 border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[10px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#f9f9f9] dark:bg-[#252525] border border-black/10 dark:border-white/10 flex items-center justify-center font-medium text-[16px] text-[#0d0d0d] dark:text-[#f0f0f0]">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              (user.displayName || user.email || 'A').slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
                {user.displayName || 'Пользователь AMEBA'}
              </h2>
            </div>
            <p className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3]">{user.email}</p>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3 mb-6">
          {/* Display Name Edit Row */}
          <div className="p-3 rounded-[10px] bg-[#f9f9f9] dark:bg-[#202020] border border-black/8 dark:border-white/10 text-[13px]">
            <div className="text-[#8f8f8f] dark:text-[#737373] text-[11px] uppercase tracking-wider mb-1 font-medium">
              Отображаемое имя
            </div>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-[13px] rounded-[6px] bg-white dark:bg-[#161616] border border-black/20 dark:border-white/20 text-[#0d0d0d] dark:text-[#f0f0f0] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-3 py-1 rounded-[6px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[12px] font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
                >
                  {savingName ? '...' : 'ОК'}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-2 py-1 text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#0d0d0d] dark:text-[#f0f0f0]">
                  {user.displayName || 'Не указано'}
                </span>
                <button
                  onClick={() => {
                    setNameInput(user.displayName || '');
                    setEditingName(true);
                  }}
                  className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Изменить</span>
                </button>
              </div>
            )}
          </div>

          {/* Email row */}
          <div className="p-3 rounded-[10px] bg-[#f9f9f9] dark:bg-[#202020] border border-black/8 dark:border-white/10 text-[13px]">
            <div className="text-[#8f8f8f] dark:text-[#737373] text-[11px] uppercase tracking-wider mb-1 font-medium flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>Электронная почта</span>
            </div>
            <div className="text-[#0d0d0d] dark:text-[#f0f0f0] font-mono text-[13px]">{user.email}</div>
          </div>

          {/* Provider row */}
          <div className="p-3 rounded-[10px] bg-[#f9f9f9] dark:bg-[#202020] border border-black/8 dark:border-white/10 text-[13px]">
            <div className="text-[#8f8f8f] dark:text-[#737373] text-[11px] uppercase tracking-wider mb-1 font-medium flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>Метод авторизации</span>
            </div>
            <div className="text-[#0d0d0d] dark:text-[#f0f0f0] flex items-center justify-between">
              <span>{providerName}</span>
              <span className="text-[11px] bg-white dark:bg-[#262626] border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded-[4px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                Firebase Auth
              </span>
            </div>
          </div>

          {/* UID & Security row */}
          <div className="p-3 rounded-[10px] bg-[#f9f9f9] dark:bg-[#202020] border border-black/8 dark:border-white/10 text-[13px]">
            <div className="text-[#8f8f8f] dark:text-[#737373] text-[11px] uppercase tracking-wider mb-1 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Идентификатор пользователя (UID)</span>
            </div>
            <div className="text-[#5d5d5d] dark:text-[#a3a3a3] font-mono text-[11px] break-all">{user.uid}</div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти из системы</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[13px] font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
