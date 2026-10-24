import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { AmebaLogo } from './AmebaLogo';

export const AuthScreen: React.FC = () => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword,
    authError,
    setAuthError
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        if (!password || password.length < 6) {
          setAuthError('Пароль должен содержать минимум 6 символов');
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else if (mode === 'reset') {
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
    <div className="min-h-screen w-screen bg-[#f9f9f9] dark:bg-[#121212] flex flex-col justify-between p-4 sm:p-6 text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors">
      {/* Top minimal brand bar */}
      <header className="max-w-[1100px] w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <AmebaLogo className="w-8 h-8 text-[#0d0d0d] dark:text-[#f0f0f0]" strokeWidth={1.8} />
          <span className="font-semibold text-[17px] tracking-tight text-[#0d0d0d] dark:text-[#f0f0f0]">
            AMEBA
          </span>
        </div>
        <div className="text-[12px] font-mono text-[#5d5d5d] dark:text-[#a3a3a3] px-2.5 py-1 rounded-[6px] bg-white dark:bg-[#1a1a1a] border border-black/8 dark:border-white/10">
          Auth Required
        </div>
      </header>

      {/* Main Centered Auth Form */}
      <main className="max-w-[440px] w-full mx-auto my-auto py-8">
        <div 
          className="rounded-[10px] bg-white dark:bg-[#181818] p-6 sm:p-8 border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-none bg-[#f9f9f9] dark:bg-[#202020] border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] mb-3">
              Обязательная авторизация
            </span>
            <h1 className="text-[24px] font-semibold leading-[1.3] text-[#0d0d0d] dark:text-[#f0f0f0]">
              {mode === 'signin' && 'Вход в AMEBA'}
              {mode === 'signup' && 'Регистрация в AMEBA'}
              {mode === 'reset' && 'Восстановление доступа'}
            </h1>
            <p className="text-[14px] leading-[1.5] text-[#5d5d5d] dark:text-[#a3a3a3] mt-2">
              {mode === 'signin' && 'Для работы с диалогами и моделью ИИ войдите в систему'}
              {mode === 'signup' && 'Создайте учетную запись для персонального доступа к платформе'}
              {mode === 'reset' && 'Укажите email, привязанный к вашему аккаунту'}
            </p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="mb-5 p-3 rounded-[10px] bg-[#f9f9f9] dark:bg-[#222] border border-black/15 dark:border-white/15 text-[13px] text-[#0d0d0d] dark:text-[#f0f0f0] leading-snug flex items-start gap-2">
              <span className="font-semibold text-xs mt-0.5">Внимание:</span>
              <span>{authError}</span>
            </div>
          )}

          {resetSent ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-[#f9f9f9] dark:bg-[#222] border border-black/10 dark:border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#0d0d0d] dark:text-white" />
              </div>
              <p className="text-[14px] text-[#0d0d0d] dark:text-[#f0f0f0] font-medium">Ссылка отправлена на {email}</p>
              <p className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3]">Проверьте почту и следуйте инструкциям для сброса пароля.</p>
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode('signin');
                }}
                className="mt-4 w-full py-2.5 px-4 rounded-[10px] bg-[#0d0d0d] dark:bg-white text-white dark:text-[#0d0d0d] text-[14px] font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors"
              >
                Вернуться ко входу
              </button>
            </div>
          ) : (
            <>
              {/* Google One-Click Button */}
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
                <span>Войти через Google</span>
              </button>

              {/* Achromatic Hairline Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-[12px] uppercase tracking-wider">
                  <span className="bg-white dark:bg-[#181818] px-2.5 text-[#8f8f8f] dark:text-[#737373]">или по почте</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] mb-1">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Иван"
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

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0]">
                        Пароль
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setMode('reset')}
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
                      placeholder="Минимум 6 знаков"
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
                    {submitting ? 'Выполняется вход...' : (
                      mode === 'signin' ? 'Войти в систему' :
                      mode === 'signup' ? 'Зарегистрироваться' : 'Отправить ссылку'
                    )}
                  </span>
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 text-center text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3]">
                {mode === 'signin' ? (
                  <div>
                    Впервые в AMEBA?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-medium text-[#0d0d0d] dark:text-white underline decoration-[rgba(0,0,0,0.3)] dark:decoration-white/30 hover:decoration-[#0d0d0d] dark:hover:decoration-white"
                    >
                      Создать аккаунт
                    </button>
                  </div>
                ) : (
                  <div>
                    Уже есть учетная запись?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="font-medium text-[#0d0d0d] dark:text-white underline decoration-[rgba(0,0,0,0.3)] dark:decoration-white/30 hover:decoration-[#0d0d0d] dark:hover:decoration-white"
                    >
                      Войти
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-[#8f8f8f] dark:text-[#737373]">
            <Lock className="w-3.5 h-3.5" />
            <span>Защита Firebase Authentication и Firestore</span>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-[700px] w-full mx-auto text-center py-4 text-[12px] text-[#8f8f8f] dark:text-[#737373] space-y-1">
        <p>AMEBA — минималистичная интеллектуальная платформа в эстетике Graphite on Warm Paper.</p>
        <p>Для обеспечения приватности доступ предоставляется только авторизованным пользователям.</p>
      </footer>
    </div>
  );
};
