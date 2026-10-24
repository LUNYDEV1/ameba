import React, { useState } from 'react';
import { Chat } from '../types';
import { useAuth } from '../context/AuthContext';
import { AmebaLogo } from './AmebaLogo';
import { 
  Plus, 
  Search, 
  Settings, 
  Pin, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  MessageSquare, 
  PanelLeftClose,
  MoreHorizontal
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onTogglePinChat: (chatId: string) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onOpenSettings,
  onOpenProfile,
}) => {
  const { user, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Filter chats by search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);

  const pinnedChats = filteredChats.filter(c => c.pinned);
  const unpinned = filteredChats.filter(c => !c.pinned);

  const todayChats = unpinned.filter(c => new Date(c.updatedAt) >= oneDayAgo);
  const yesterdayChats = unpinned.filter(c => {
    const d = new Date(c.updatedAt);
    return d < oneDayAgo && d >= new Date(now.getTime() - 48 * 3600 * 1000);
  });
  const olderChats = unpinned.filter(c => new Date(c.updatedAt) < new Date(now.getTime() - 48 * 3600 * 1000));

  const startRename = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveRename = (chatId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const renderChatGroup = (title: string, groupChats: Chat[]) => {
    if (groupChats.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-2.5 py-1 text-[11px] font-semibold text-[#8f8f8f] dark:text-[#737373] uppercase tracking-wider">
          {title}
        </div>
        <div className="space-y-0.5 mt-0.5">
          {groupChats.map((chat) => {
            const isActive = chat.id === currentChatId;
            const isEditing = chat.id === editingChatId;

            return (
              <div
                key={chat.id}
                onClick={() => !isEditing && onSelectChat(chat.id)}
                className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-[10px] cursor-pointer text-[14px] transition-all ${
                  isActive 
                    ? 'bg-black/6 dark:bg-white/10 font-medium text-[#0d0d0d] dark:text-[#f0f0f0]' 
                    : 'text-[#0d0d0d] dark:text-[#e0e0e0] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
              >
                {isEditing ? (
                  <form 
                    onSubmit={(e) => saveRename(chat.id, e)} 
                    className="flex items-center gap-1 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-1.5 py-0.5 text-[13px] bg-white dark:bg-[#222] border border-black/20 dark:border-white/20 rounded-[6px] text-[#0d0d0d] dark:text-[#f0f0f0] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-[#0d0d0d] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-[4px]"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingChatId(null)}
                      className="p-1 text-[#5d5d5d] dark:text-[#a3a3a3] hover:bg-black/5 dark:hover:bg-white/5 rounded-[4px]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                      {chat.pinned ? (
                        <Pin className="w-3.5 h-3.5 text-[#0d0d0d] dark:text-[#f0f0f0] flex-shrink-0" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-[#8f8f8f] dark:text-[#737373] group-hover:text-[#5d5d5d] dark:group-hover:text-[#a3a3a3] flex-shrink-0" />
                      )}
                      <span className="truncate text-[13.5px] leading-tight font-normal">
                        {chat.title}
                      </span>
                    </div>

                    {/* Quick action buttons on hover */}
                    <div className="hidden group-hover:flex items-center gap-0.5 ml-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePinChat(chat.id);
                        }}
                        className={`p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white ${
                          chat.pinned ? 'text-[#0d0d0d] dark:text-white' : ''
                        }`}
                        title={chat.pinned ? 'Открепить' : 'Закрепить'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => startRename(chat, e)}
                        className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white"
                        title="Переименовать"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 transition-opacity bg-black/50 dark:bg-black/70"
          onClick={onClose}
        />
      )}

      {/* Sidebar Rail */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-[270px] bg-[#f9f9f9] dark:bg-[#171717] border-r border-black/10 dark:border-white/10 flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[270px]'
        }`}
      >
        {/* Top Header: Brand & New Chat */}
        <div className="p-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AmebaLogo className="w-5 h-5 text-[#0d0d0d] dark:text-[#f0f0f0]" strokeWidth={1.8} />
            <span className="font-semibold text-[15px] tracking-tight text-[#0d0d0d] dark:text-[#f0f0f0]">
              AMEBA
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-1.5 rounded-[8px] text-[#0d0d0d] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Создать новый чат"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[8px] text-[#5d5d5d] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Свернуть боковую панель"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input in Sidebar */}
        <div className="px-3 py-1.5">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#8f8f8f] dark:text-[#737373] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск диалогов..."
              className="w-full pl-8 pr-2.5 py-1.5 text-[13px] rounded-[8px] bg-white dark:bg-[#202020] border border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#f0f0f0] placeholder-[#8f8f8f] dark:placeholder-[#737373] focus:outline-none focus:border-[#0d0d0d] dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#8f8f8f] dark:text-[#a3a3a3] hover:text-[#0d0d0d] dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 px-4 text-[#8f8f8f] dark:text-[#737373] text-[13px]">
              Диалогов пока нет. Нажмите «+», чтобы начать.
            </div>
          ) : (
            <>
              {renderChatGroup('Закрепленные', pinnedChats)}
              {renderChatGroup('Сегодня', todayChats)}
              {renderChatGroup('Вчера', yesterdayChats)}
              {renderChatGroup('Ранее', olderChats)}
            </>
          )}
        </div>

        {/* Sidebar Footer Block */}
        <div className="p-3 border-t border-black/10 dark:border-white/10 space-y-2 bg-[#f9f9f9] dark:bg-[#171717] transition-colors">
          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13.5px] text-[#0d0d0d] dark:text-[#f0f0f0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4 text-[#5d5d5d] dark:text-[#a3a3a3]" />
            <span>Настройки платформы</span>
          </button>

          {/* User Account */}
          {user ? (
            <div 
              onClick={onOpenProfile}
              className="flex items-center justify-between p-2 rounded-[10px] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-[#252525] border border-black/10 dark:border-white/10 flex items-center justify-center text-[12px] font-semibold text-[#0d0d0d] dark:text-white flex-shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user.displayName || user.email || 'A').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] truncate">
                    {user.displayName || 'Пользователь AMEBA'}
                  </div>
                  <div className="text-[11px] text-[#5d5d5d] dark:text-[#a3a3a3] truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#8f8f8f] dark:text-[#737373] flex-shrink-0" />
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => openAuthModal('signin')}
                className="w-full h-[36px] flex items-center justify-center px-4 rounded-full bg-white dark:bg-[#252525] border border-black/15 dark:border-white/15 text-[14px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] transition-all hover:bg-black/5 dark:hover:bg-white/5"
              >
                Войти в аккаунт
              </button>
              <p className="text-[12px] text-[#8f8f8f] dark:text-[#737373] leading-[1.43] text-center px-1">
                Для синхронизации диалогов в Firebase
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
