import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { Composer } from './components/Composer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { Chat, Message, ModelOption, AVAILABLE_MODELS } from './types';
import { ChatStorage } from './services/chatStorage';
import { sendChatMessageToAmeba } from './services/amebaApi';
import { AmebaLogo } from './components/AmebaLogo';

function MainApp() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>(() => ChatStorage.getStoredChats(user?.uid));
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    const stored = ChatStorage.getStoredChats(user?.uid);
    return stored.length > 0 ? stored[0].id : null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModel, setActiveModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [composerInitialPrompt, setComposerInitialPrompt] = useState('');
  
  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [creativityMode, setCreativityMode] = useState<'precise' | 'balanced' | 'creative'>('balanced');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync with Firestore and load user chats when user logs in
  useEffect(() => {
    if (user?.uid) {
      ChatStorage.syncWithFirestore(user.uid);
      const userChats = ChatStorage.getStoredChats(user.uid);
      setChats(userChats);
      if (userChats.length > 0 && !currentChatId) {
        setCurrentChatId(userChats[0].id);
      }
    }
  }, [user]);

  // Load messages whenever currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const loaded = ChatStorage.getStoredMessages(currentChatId);
      setMessages(loaded);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Keyboard shortcut: Cmd+K or Ctrl+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      userId: user?.uid || 'local',
      title: 'Новый диалог',
      model: activeModel.id,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    ChatStorage.saveStoredChats(updatedChats);
    setCurrentChatId(newChatId);
    setMessages([]);
    setComposerInitialPrompt('');
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setComposerInitialPrompt('');
  };

  const handleDeleteChat = (chatId: string) => {
    const updated = chats.filter(c => c.id !== chatId);
    setChats(updated);
    ChatStorage.saveStoredChats(updated);
    if (currentChatId === chatId) {
      setCurrentChatId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    const updated = chats.map(c => c.id === chatId ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c);
    setChats(updated);
    ChatStorage.saveStoredChats(updated);
  };

  const handleTogglePinChat = (chatId: string) => {
    const updated = chats.map(c => c.id === chatId ? { ...c, pinned: !c.pinned } : c);
    setChats(updated);
    ChatStorage.saveStoredChats(updated);
  };

  const handleClearCurrentChat = () => {
    if (!currentChatId) return;
    setMessages([]);
    ChatStorage.saveStoredMessages(currentChatId, []);
  };

  const handleClearAllChats = () => {
    setChats([]);
    ChatStorage.saveStoredChats([]);
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleExportMarkdown = () => {
    if (!currentChatId || messages.length === 0) return;
    const currentChat = chats.find(c => c.id === currentChatId);
    const title = currentChat ? currentChat.title : 'AMEBA Conversation';
    
    let md = `# ${title}\n\n*Модель: ${activeModel.name} | Дата: ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    messages.forEach((m) => {
      md += `### ${m.role === 'user' ? 'Вы' : 'AMEBA'} (${new Date(m.createdAt).toLocaleTimeString()}):\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (
    content: string, 
    options: { webSearch: boolean; attachedFile?: string }
  ) => {
    let chatId = currentChatId;

    // If no chat active, create one on the fly
    if (!chatId) {
      const newChatId = `chat-${Date.now()}`;
      const titleFromPrompt = content.length > 35 ? content.slice(0, 35) + '...' : content;
      const newChat: Chat = {
        id: newChatId,
        userId: user?.uid || 'local',
        title: titleFromPrompt,
        model: activeModel.id,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newChat, ...chats];
      setChats(updated);
      ChatStorage.saveStoredChats(updated);
      chatId = newChatId;
      setCurrentChatId(newChatId);
    } else {
      // Update chat title if it was "Новый диалог" and it's the first message
      const current = chats.find(c => c.id === chatId);
      if (current && (current.title === 'Новый диалог' || messages.length === 0)) {
        const titleFromPrompt = content.length > 35 ? content.slice(0, 35) + '...' : content;
        handleRenameChat(chatId, titleFromPrompt);
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

      const finalContent = await sendChatMessageToAmeba(
        apiHistory,
        systemPrompt,
        activeModel.id,
        (accumulated) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: accumulated, isStreaming: true }
                : m
            )
          );
        },
        abortController.signal
      );

      const finalAssistantMsg: Message = {
        id: assistantMsgId,
        chatId,
        userId: 'assistant',
        role: 'assistant',
        content: finalContent,
        createdAt: new Date().toISOString(),
        isStreaming: false,
      };

      const finalMessagesList = [...newMessages, finalAssistantMsg];
      setMessages(finalMessagesList);
      ChatStorage.saveStoredMessages(chatId, finalMessagesList);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        // Generation was intentionally stopped
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
    }
    setIsGenerating(false);
  };

  const handleRegenerateLast = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const trimmed = messages.filter((_, idx) => idx !== messages.length - 1);
      setMessages(trimmed);
      handleSendMessage(lastUserMsg.content, { webSearch: false });
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Conversation Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#121212] relative transition-colors">
        {/* Header Strip */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeModel={activeModel}
          onSelectModel={setActiveModel}
          currentChat={currentChat}
          onNewChat={handleNewChat}
          onClearCurrentChat={handleClearCurrentChat}
          onExportMarkdown={handleExportMarkdown}
          onOpenSettings={() => setIsSettingsOpen(true)}
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
          />
        </footer>
      </div>

      {/* User Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* Settings Modal */}
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
      />

      {/* Optional Auth Modal for re-auth if needed */}
      <AuthModal />
    </div>
  );
}

function AppRoot() {
  const { user, loading } = useAuth();

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
    return <AuthScreen />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </ThemeProvider>
  );
}
