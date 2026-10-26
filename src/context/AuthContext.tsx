import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile, 
  onAuthStateChanged, 
  User, 
  db, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot 
} from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'reset';
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubsDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (unsubsDoc) {
        unsubsDoc();
        unsubsDoc = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Ensure user doc exists
        try {
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Пользователь AMEBA',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || undefined,
              tariff: 'free',
              usedTokens: 0,
              createdAt: new Date().toISOString(),
              providerId: currentUser.providerData[0]?.providerId || 'password',
            };
            await setDoc(userDocRef, newProfile);
          }
        } catch (err) {
          console.warn('Could not ensure user doc:', err);
        }

        // Live snapshot listener to keep profile (tariff & tokens) synced in real time
        unsubsDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          }
        }, (err) => {
          console.warn('Profile snapshot error:', err);
        });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubsDoc) unsubsDoc();
    };
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' | 'reset' = 'signin') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (err: unknown) {
      console.error('Google auth error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Окно входа было закрыто. Попробуйте еще раз.');
      } else if (code === 'auth/cancelled-popup-request') {
        // user clicked again, safe to ignore
      } else {
        setAuthError('Не удалось выполнить вход через Google. Попробуйте еще раз.');
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      closeAuthModal();
    } catch (err: unknown) {
      console.error('Email signin error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setAuthError('Неверный адрес электронной почты или пароль.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('Пожалуйста, введите корректный адрес эл. почты.');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Провайдер Email/Password требует активации в консоли Firebase. Используйте вход через Google.');
      } else {
        setAuthError('Ошибка входа. Проверьте данные и повторите попытку.');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      closeAuthModal();
    } catch (err: unknown) {
      console.error('Email signup error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setAuthError('Пользователь с такой почтой уже зарегистрирован. Войдите в аккаунт.');
      } else if (code === 'auth/weak-password') {
        setAuthError('Пароль слишком простой (минимум 6 символов).');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Провайдер Email/Password требует активации в консоли Firebase. Используйте вход через Google.');
      } else {
        setAuthError('Не удалось создать аккаунт. Попробуйте войти через Google.');
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/user-not-found') {
        setAuthError('Пользователь с таким email не найден.');
      } else {
        setAuthError('Не удалось отправить ссылку для сброса пароля.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser({ ...auth.currentUser, displayName: name });
      setUserProfile(prev => prev ? { ...prev, displayName: name } : null);
      // Also update firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { displayName: name, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('Update display name error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        updateDisplayName,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
