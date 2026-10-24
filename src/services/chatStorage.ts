import { Chat, Message } from '../types';
import { 
  db, 
  auth, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc 
} from '../firebase';

const LOCAL_STORAGE_CHATS_KEY = 'ameba_chats_v1';
const LOCAL_STORAGE_MESSAGES_KEY = 'ameba_messages_v1';

export const ChatStorage = {
  getStoredChats(userId?: string): Chat[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CHATS_KEY);
      if (!raw) return [];
      const parsed: Chat[] = JSON.parse(raw);
      if (userId) {
        return parsed.filter(c => c.userId === userId || c.userId === 'local');
      }
      return parsed;
    } catch {
      return [];
    }
  },

  saveStoredChats(chats: Chat[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error('Failed to save chats to storage', e);
    }
  },

  getStoredMessages(chatId: string): Message[] {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${chatId}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveStoredMessages(chatId: string, messages: Message[]): void {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${chatId}`, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages to storage', e);
    }
  },

  deleteStoredChat(chatId: string, userId?: string): void {
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${chatId}`);
      const chats = this.getStoredChats(userId).filter(c => c.id !== chatId);
      this.saveStoredChats(chats);

      if (userId && auth.currentUser) {
        deleteDoc(doc(db, 'users', userId, 'chats', chatId)).catch(console.warn);
      }
    } catch (e) {
      console.error('Failed to delete chat', e);
    }
  },

  async syncWithFirestore(userId: string): Promise<void> {
    if (!userId || !auth.currentUser) return;
    try {
      const chatsRef = collection(db, 'users', userId, 'chats');
      const snap = await getDocs(chatsRef);
      
      if (!snap.empty) {
        // Load cloud chats
        const cloudChats: Chat[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
        const localChats = this.getStoredChats(userId);
        
        // Merge without duplicates
        const map = new Map<string, Chat>();
        cloudChats.forEach(c => map.set(c.id, c));
        localChats.forEach(c => {
          if (!map.has(c.id)) map.set(c.id, c);
        });
        
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        this.saveStoredChats(merged);
      } else {
        // Upload any existing local chats to cloud
        const localChats = this.getStoredChats(userId);
        for (const chat of localChats) {
          const chatDoc = doc(db, 'users', userId, 'chats', chat.id);
          await setDoc(chatDoc, {
            userId,
            title: chat.title,
            model: chat.model,
            pinned: Boolean(chat.pinned),
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          });

          const msgs = this.getStoredMessages(chat.id);
          for (const msg of msgs) {
            const msgDoc = doc(db, 'users', userId, 'chats', chat.id, 'messages', msg.id);
            await setDoc(msgDoc, {
              chatId: chat.id,
              userId,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  },

  async persistMessageToFirestore(chatId: string, message: Message, userId: string): Promise<void> {
    if (!userId || !auth.currentUser || userId === 'local') return;
    try {
      const msgDoc = doc(db, 'users', userId, 'chats', chatId, 'messages', message.id);
      await setDoc(msgDoc, {
        chatId,
        userId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      });

      // Update chat updatedAt
      const chatDoc = doc(db, 'users', userId, 'chats', chatId);
      await setDoc(chatDoc, {
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not persist message to firestore:', err);
    }
  }
};
