import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    openAuthModal,
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword,
    authError,
    setAuthError
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      if (authModalMode === 'signin') {
        await signInWithEmail(email, password);
      } else if (authModalMode === 'signup') {
        if (!password || password.length < 6) {
          setAuthError('Пароль должен содержать минимум 6 символов');
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else if (authModalMode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch {
      // error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch {
      // error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 transition-colors"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div 
        className="relative w-full max-w-[420px] rounded-[10px] bg-white dark:bg-[#181818] p-6 border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-[10px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-none bg-[#f9f9f9] dark:bg-[#202020] border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0]">
              AMEBA Auth
            </span>
          </div>
          <h2 className="text-[20px] font-semibold leading-[1.3] text-[#0d0d0d] dark:text-[#f0f0f0]">
            {authModalMode === 'signin' && 'Вход в аккаунт'}
            {authModalMode === 'signup' && 'Создать аккаунт AMEBA'}
            {authModalMode === 'reset' && 'Восстановление доступа'}
          </h2>
          <p className="text-[14px] leading-[1.43] text-[#5d5d5d] dark:text-[#a3a3a3] mt-1">
            {authModalMode === 'signin' && 'Синхронизируйте историю чатов и настройки между устройствами'}
            {authModalMode === 'signup' && 'Присоединяйтесь к платформе с поддержкой облачного сохранения'}
            {authModalMode === 'reset' && 'Введите почту для получения инструкций по сбросу пароля'}
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-[10px] bg-[#f9f9f9] dark:bg-[#222] border border-black/15 dark:border-white/15 text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0] leading-snug flex items-start gap-2">
            <span className="font-semibold text-xs mt-0.5">Внимание:</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Password Reset Confirmation */}
        {resetSent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-[#f9f9f9] dark:bg-[#202020] border border-black/10 dark:border-white/10">
              <CheckCircle2 className="w-5 h-5 text-[#0d0d0d] dark:text-white" />
            </div>
            <p className="text-[14px] text-[#0d0d0d] dark:text-[#f0f0f0] font-medium">Ссылка отправлена на {email}</p>
            <p className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3]">Проверьте папку «Входящие» и следуйте указаниям в письме.</p>
            <button
              onClick={() => {
                setResetSent(false);
                openAuthModal('signin');
              }}
              className="mt-4 w-full py-2 px-4 rounded-[10px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[14px] font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
            >
              Вернуться ко входу
            </button>
          </div>
        ) : (
          <>
            {/* Google Quick Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-[10px] bg-white dark:bg-[#202020] border border-black/15 dark:border-white/15 text-[14px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Продолжить с Google</span>
            </button>

            {/* Hairline Divider with Text */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-[12px] uppercase tracking-wider">
                <span className="bg-white dark:bg-[#181818] px-2 text-[#8f8f8f] dark:text-[#737373]">или через эл. почту</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === 'signup' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Например, Александр"
                    className="w-full px-3 py-2 text-[14px] rounded-[10px] bg-white dark:bg-[#141414] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none focus:border-[#0d0d0d] dark:focus:border-white transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 text-[14px] rounded-[10px] bg-white dark:bg-[#141414] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none focus:border-[#0d0d0d] dark:focus:border-white transition-colors"
                />
              </div>

              {authModalMode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0]">
                      Пароль
                    </label>
                    {authModalMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => openAuthModal('reset')}
                        className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white transition-colors"
                      >
                        Забыли пароль?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full px-3 py-2 text-[14px] rounded-[10px] bg-white dark:bg-[#141414] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none focus:border-[#0d0d0d] dark:focus:border-white transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-[10px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                <span>
                  {submitting ? 'Обработка...' : (
                    authModalMode === 'signin' ? 'Войти' :
                    authModalMode === 'signup' ? 'Зарегистрироваться' : 'Отправить ссылку'
                  )}
                </span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Bottom Toggle */}
            <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 text-center text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3]">
              {authModalMode === 'signin' ? (
                <div>
                  Нет учетной записи?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="font-medium text-[#0d0d0d] dark:text-white underline decoration-[rgba(0,0,0,0.3)] dark:decoration-white/30 hover:decoration-[#0d0d0d] dark:hover:decoration-white"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              ) : (
                <div>
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="font-medium text-[#0d0d0d] dark:text-white underline decoration-[rgba(0,0,0,0.3)] dark:decoration-white/30 hover:decoration-[#0d0d0d] dark:hover:decoration-white"
                  >
                    Войти
                  </button>
                </div>
              )}
            </div>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#8f8f8f] dark:text-[#737373]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Защищено правилами Firebase Firestore ABAC</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
