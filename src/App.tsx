import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LimitProvider, useLimits } from './context/LimitContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { Composer } from './components/Composer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal, LegacySettingsTab } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { Chat, Message, ModelOption, AVAILABLE_MODELS } from './types';
import { ChatStorage } from './services/chatStorage';
import { sendChatMessageToAmeba } from './services/amebaApi';
import { AmebaLogo } from './components/AmebaLogo';

function MainApp() {
  const { user } = useAuth();
  const { addTokenUsage, isLimitReached } = useLimits();
  const [chats, setChats] = useState<Chat[]>(() => ChatStorage.getStoredChats(user?.uid));
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    const stored = ChatStorage.getStoredChats(user?.uid);
    return stored.length > 0 ? stored[0].id : null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [composerInitialPrompt, setComposerInitialPrompt] = useState('');
  
  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<LegacySettingsTab>('settings');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [creativityMode, setCreativityMode] = useState<'precise' | 'balanced' | 'creative'>('balanced');

  const handleOpenSettings = (tab: LegacySettingsTab = 'settings') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync with Firestore and load user chats when user logs in
  useEffect(() => {
    if (user?.uid) {
      ChatStorage.syncWithFirestore(user.uid).then(() => {
        const syncedChats = ChatStorage.getStoredChats(user.uid);
        setChats(syncedChats);
        if (syncedChats.length > 0 && !currentChatId) {
          setCurrentChatId(syncedChats[0].id);
        }
      });
    }
  }, [user]);

  // Load messages for selected chat
  useEffect(() => {
    if (currentChatId) {
      const storedMsgs = ChatStorage.getStoredMessages(currentChatId);
      setMessages(storedMsgs);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Actions
  const handleNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      userId: user?.uid || 'local',
      title: 'Новый диалог',
      model: activeModel.name,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);
    ChatStorage.saveStoredChats(updatedChats);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    ChatStorage.deleteStoredChat(id, user?.uid);
    const updated = chats.filter(c => c.id !== id);
    setChats(updated);
    if (currentChatId === id) {
      setCurrentChatId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = chats.map(c => 
      c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
    );
    setChats(updated);
    ChatStorage.saveStoredChats(updated);
  };

  const handleTogglePinChat = (id: string) => {
    const updated = chats.map(c => 
      c.id === id ? { ...c, pinned: !c.pinned } : c
    );
    setChats(updated);
    ChatStorage.saveStoredChats(updated);
  };

  const handleClearAllChats = () => {
    chats.forEach(c => ChatStorage.deleteStoredChat(c.id, user?.uid));
    setChats([]);
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleClearCurrentChat = () => {
    if (!currentChatId) return;
    ChatStorage.saveStoredMessages(currentChatId, []);
    setMessages([]);
  };

  const handleExportMarkdown = () => {
    if (!currentChatId || messages.length === 0) return;
    const chatTitle = chats.find(c => c.id === currentChatId)?.title || 'AMEBA Chat';
    
    let mdContent = `# ${chatTitle}\n\n*Экспорт диалога AMEBA AI (${new Date().toLocaleDateString('ru-RU')})*\n\n---\n\n`;
    messages.forEach(m => {
      const sender = m.role === 'user' ? 'Пользователь' : 'AMEBA AI';
      mdContent += `### **${sender}**:\n${m.content}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${chatTitle.toLowerCase().replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async (
    content: string, 
    options: { webSearch: boolean; thinkingMode: boolean; attachedFile?: string }
  ) => {
    if (isLimitReached) {
      handleOpenSettings('tariffs');
      return;
    }
    let chatId = currentChatId;

    // Create a new chat if none selected
    if (!chatId) {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        userId: user?.uid || 'local',
        title: content.slice(0, 30) || 'Новый диалог',
        model: activeModel.name,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      setCurrentChatId(newChat.id);
      chatId = newChat.id;
      ChatStorage.saveStoredChats(updatedChats);
    } else {
      // Auto-update title for initial default name
      const curr = chats.find(c => c.id === chatId);
      if (curr && curr.title === 'Новый диалог' && messages.length === 0) {
        handleRenameChat(chatId, content.slice(0, 32));
      }
    }

    // 1. Add User Message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      chatId,
      userId: user?.uid || 'local',
      role: 'user',
      content: options.attachedFile ? `[Вложение: ${options.attachedFile}]\n\n${content}` : content,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    ChatStorage.saveStoredMessages(chatId, newMessages);
    if (user?.uid) {
      ChatStorage.persistMessageToFirestore(chatId, userMessage, user.uid);
    }

    // 2. Prepare streaming Assistant Message
    setIsGenerating(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantMsgId = `msg-${Date.now()}-ai`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      chatId,
      userId: 'assistant',
      role: 'assistant',
      content: '',
      reasoningContent: '',
      isThinking: options.thinkingMode,
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages([...newMessages, initialAssistantMsg]);

    try {
      // Prepare conversation history for the API
      const apiHistory = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendChatMessageToAmeba(
        apiHistory,
        {
          systemPrompt,
          model: activeModel.id,
          webSearch: options.webSearch,
          thinkingMode: options.thinkingMode,
          onUpdate: (update) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: update.content,
                      reasoningContent: update.reasoningContent,
                      isThinking: update.isThinking,
                      thinkingTimeSeconds: update.thinkingTimeSeconds,
                      sources: update.sources,
                      isStreaming: true,
                    }
                  : m
              )
            );
          },
          signal: abortController.signal,
        }
      );

      const finalAssistantMsg: Message = {
        id: assistantMsgId,
        chatId,
        userId: 'assistant',
        role: 'assistant',
        content: result.content,
        reasoningContent: result.reasoningContent,
        sources: result.sources,
        createdAt: new Date().toISOString(),
        isStreaming: false,
      };

      const finalMessagesList = [...newMessages, finalAssistantMsg];
      setMessages(finalMessagesList);
      ChatStorage.saveStoredMessages(chatId, finalMessagesList);
      if (user?.uid) {
        ChatStorage.persistMessageToFirestore(chatId, finalAssistantMsg, user.uid);
      }

      // Calculate token consumption for the prompt + completion pair
      const consumed = Math.max(800, Math.round((content.length + result.content.length) * 1.5));
      addTokenUsage(consumed);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, isStreaming: false }
              : m
          )
        );
      } else {
        const errorText = `Ошибка при обращении к сервису AMEBA: ${err instanceof Error ? err.message : String(err)}`;
        const finalAssistantMsg: Message = {
          id: assistantMsgId,
          chatId,
          userId: 'assistant',
          role: 'assistant',
          content: errorText,
          createdAt: new Date().toISOString(),
          isStreaming: false,
        };
        const finalMessagesList = [...newMessages, finalAssistantMsg];
        setMessages(finalMessagesList);
        ChatStorage.saveStoredMessages(chatId, finalMessagesList);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleRegenerateLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const trimmed = messages.filter((_, idx) => idx !== messages.length - 1);
      setMessages(trimmed);
      handleSendMessage(lastUserMsg.content, { webSearch: false, thinkingMode: true });
    }
  };

  const handleSelectStarterPrompt = (promptText: string) => {
    setComposerInitialPrompt(promptText);
  };

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#121212] text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onOpenSettings={handleOpenSettings}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Conversation Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#121212] relative transition-colors">
        {/* Header Strip */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentChat={currentChat}
          onNewChat={handleNewChat}
          onClearCurrentChat={handleClearCurrentChat}
          onExportMarkdown={handleExportMarkdown}
          onOpenSettings={() => handleOpenSettings('general')}
        />

        {/* Content Area: Chat Thread or Welcome Screen */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen 
              onSelectPrompt={handleSelectStarterPrompt} 
              activeModel={activeModel}
            />
          ) : (
            <div className="flex-1 py-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={handleRegenerateLast}
                  isLastAssistant={index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Bottom Composer Box */}
        <footer className="w-full bg-white dark:bg-[#121212] flex-shrink-0 transition-colors">
          <Composer
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onStopGeneration={handleStopGeneration}
            activeModel={activeModel}
            initialPrompt={composerInitialPrompt}
            onOpenTariffs={() => handleOpenSettings('tariffs')}
          />
        </footer>
      </div>

      {/* User Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onOpenTariffs={() => handleOpenSettings('tariffs')}
      />

      {/* Unified Settings & Legal Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompt={systemPrompt}
        onSaveSystemPrompt={setSystemPrompt}
        creativityMode={creativityMode}
        onChangeCreativityMode={setCreativityMode}
        chats={chats}
        onClearAllChats={handleClearAllChats}
        currentChatTitle={currentChat?.title}
        initialTab={settingsTab}
      />

      {/* Optional Auth Modal for re-auth if needed */}
      <AuthModal />
    </div>
  );
}

function AppRoot() {
  const { user, loading } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<LegacySettingsTab>('legal');

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f9f9f9] dark:bg-[#121212] text-[#0d0d0d] dark:text-[#f0f0f0] transition-colors">
        <AmebaLogo className="w-12 h-12 text-[#0d0d0d] dark:text-[#f0f0f0] animate-pulse mb-3" strokeWidth={1.8} />
        <div className="text-[13px] font-medium text-[#5d5d5d] dark:text-[#a3a3a3]">
          Загрузка сессии AMEBA...
        </div>
      </div>
    );
  }

  // Mandatory Authentication: if not logged in, render the dedicated AuthScreen
  if (!user) {
    return (
      <>
        <AuthScreen 
          onOpenLegal={(tab) => { 
            setSettingsTab(tab || 'payment-legal'); 
            setIsSettingsOpen(true); 
          }} 
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          systemPrompt=""
          onSaveSystemPrompt={() => {}}
          creativityMode="balanced"
          onChangeCreativityMode={() => {}}
          chats={[]}
          onClearAllChats={() => {}}
          initialTab={settingsTab}
        />
      </>
    );
  }

  return <MainApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LimitProvider>
          <AppRoot />
        </LimitProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
