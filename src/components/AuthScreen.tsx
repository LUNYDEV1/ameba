import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { AmebaLogo } from './AmebaLogo';
import { SmartCaptcha } from '@yandex/smart-captcha';

interface AuthScreenProps {
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'security') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenLegal }) => {
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
  const [captchaToken, setCaptchaToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setAuthError('Пожалуйста, пройдите проверку Yandex SmartCaptcha');
      return;
    }

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
    if (!captchaToken) {
      setAuthError('Пожалуйста, пройдите проверку Yandex SmartCaptcha');
      return;
    }
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
    <div className="min-h-screen w-full bg-[#f9f9f9] dark:bg-[#121212] flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Bar with Branding & Status */}
      <header className="w-full max-w-[1200px] mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-[#0d0d0d] dark:text-[#f0f0f0] flex items-center justify-center">
            <AmebaLogo className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <span className="font-semibold text-[17px] tracking-tight text-[#0d0d0d] dark:text-[#f0f0f0]">
            AMEBA
          </span>
        </div>

        <div className="text-[12px] font-mono text-[#5d5d5d] dark:text-[#a3a3a3] px-2.5 py-1 rounded-[6px] bg-white dark:bg-[#1a1a1a] border border-black/8 dark:border-white/10 flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>Auth Required</span>
        </div>
      </header>

      {/* Main Centered Auth Form */}
      <main className="max-w-[440px] w-full mx-auto my-auto py-8">
        <div 
          className="rounded-[10px] bg-white dark:bg-[#181818] p-6 sm:p-8 border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors animate-scale-in"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-none bg-[#f9f9f9] dark:bg-[#202020] border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] mb-3">
              Обязательная авторизация
            </span>
            <h1 className="text-[22px] font-bold text-[#0d0d0d] dark:text-[#f0f0f0] tracking-tight">
              {mode === 'signin' && 'Вход в AMEBA'}
              {mode === 'signup' && 'Создание аккаунта'}
              {mode === 'reset' && 'Восстановление доступа'}
            </h1>
            <p className="text-[13px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-1">
              Для работы с диалогами и моделью ИИ войдите в систему
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">
              {authError}
            </div>
          )}

          {/* Success Banner for Password Reset */}
          {resetSent ? (
            <div className="p-4 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#0d0d0d] dark:text-white mx-auto mb-2" />
              <h3 className="font-semibold text-[14px]">Ссылка отправлена</h3>
              <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-1">
                Проверьте ваш почтовый ящик для восстановления пароля
              </p>
              <button
                onClick={() => { setResetSent(false); setMode('signin'); }}
                className="mt-3 text-[12px] font-medium underline text-[#0d0d0d] dark:text-white"
              >
                Вернуться к входу
              </button>
            </div>
          ) : (
            <>
              {/* Google One-Tap / OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-[10px] bg-white dark:bg-[#141414] border border-black/15 dark:border-white/15 text-[#0d0d0d] dark:text-[#f0f0f0] text-[14px] font-medium flex items-center justify-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
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

                {/* YANDEX SMARTCAPTCHA INTEGRATION */}
                <div className="my-3 flex justify-center">
                  <SmartCaptcha
                    sitekey="ysc1_3cIeBJkSBR0HHwvLyI5dot9ipolHvYCUWluqgIg5e3860d7b"
                    onSuccess={setCaptchaToken}
                  />
                </div>

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
                      onClick={() => setMode('signup')}
                      className="font-medium text-[#0d0d0d] dark:text-white hover:underline"
                    >
                      Создать аккаунт
                    </button>
                  </div>
                ) : (
                  <div>
                    Уже есть аккаунт?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="font-medium text-[#0d0d0d] dark:text-white hover:underline"
                    >
                      Войти
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Protection Footer Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#8f8f8f] dark:text-[#737373]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5d5d5d] dark:text-[#a3a3a3]" />
          <span>Защита Yandex SmartCaptcha & Firebase Auth</span>
        </div>
      </main>

      {/* Footer copyright & Policy Links */}
      <footer className="w-full max-w-[1200px] mx-auto text-center py-2 text-[12px] text-[#8f8f8f] dark:text-[#737373] flex flex-wrap items-center justify-center gap-3">
        <span>© AMEBA AI.</span>
        <button onClick={() => onOpenLegal?.('privacy')} className="hover:underline text-[#0d0d0d] dark:text-[#f0f0f0]">
          Политика конфиденциальности
        </button>
        <span>•</span>
        <button onClick={() => onOpenLegal?.('terms')} className="hover:underline text-[#0d0d0d] dark:text-[#f0f0f0]">
          Условия использования
        </button>
        <span>•</span>
        <button onClick={() => onOpenLegal?.('security')} className="hover:underline text-[#0d0d0d] dark:text-[#f0f0f0]">
          Защита данных
        </button>
      </footer>
    </div>
  );
};
