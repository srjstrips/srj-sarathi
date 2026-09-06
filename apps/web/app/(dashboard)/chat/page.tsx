'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Send, MoreHorizontal, Users, Hash, X, Phone, Video, Info, Paperclip, Smile, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface Conversation {
  id: string; name: string; type: 'dm' | 'group' | 'dept';
  lastMessage: string; lastTime: string; unread: number;
  online?: boolean; members?: number; avatar?: string;
}

interface Message {
  id: string; senderId: string; senderName: string;
  content: string; time: string; isMe?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Rahul Kumar',           type: 'dm',    lastMessage: 'Inspection completed on roll #3', lastTime: '10:32 AM', unread: 2, online: true },
  { id: '2', name: 'Production HOD',        type: 'dm',    lastMessage: 'Please check the Q3 schedule',   lastTime: '09:15 AM', unread: 0, online: false },
  { id: '3', name: 'Maintenance Team',      type: 'group', lastMessage: 'Amit: Parts order placed',       lastTime: 'Yesterday', unread: 5, members: 8 },
  { id: '4', name: 'Production Department', type: 'dept',  lastMessage: 'Shift change at 6 PM',           lastTime: 'Yesterday', unread: 0, members: 45 },
  { id: '5', name: 'Quality Inspectors',    type: 'group', lastMessage: 'Report submitted',               lastTime: '2 days',    unread: 0, members: 6 },
  { id: '6', name: 'HR Department',         type: 'dept',  lastMessage: 'Leave policy updated',           lastTime: '3 days',    unread: 1, members: 12 },
];

const MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: 'r1', senderName: 'Rahul Kumar', content: 'Good morning! Roll mill bearing check done', time: '9:00 AM' },
    { id: 'm2', senderId: 'me', senderName: 'Me',          content: 'Good. Any issues found?', time: '9:02 AM', isMe: true },
    { id: 'm3', senderId: 'r1', senderName: 'Rahul Kumar', content: 'Minor wear on bearing #2. Will need replacement next week.', time: '9:05 AM' },
    { id: 'm4', senderId: 'me', senderName: 'Me',          content: 'Noted. Please log a maintenance task.', time: '9:07 AM', isMe: true },
    { id: 'm5', senderId: 'r1', senderName: 'Rahul Kumar', content: 'Done. Task created. Inspection completed on roll #3 as well, all good.', time: '10:32 AM' },
  ],
  '2': [
    { id: 'm1', senderId: 'h1', senderName: 'Production HOD', content: 'Please check the Q3 production schedule', time: '9:15 AM' },
  ],
  '3': [
    { id: 'm1', senderId: 'a1', senderName: 'Amit',  content: 'Team meeting at 3 PM', time: 'Yesterday 2:00 PM' },
    { id: 'm2', senderId: 'r1', senderName: 'Rahul', content: 'Confirmed', time: 'Yesterday 2:05 PM' },
    { id: 'm3', senderId: 'a1', senderName: 'Amit',  content: 'Parts order placed, will arrive tomorrow', time: 'Yesterday 5:30 PM' },
  ],
};

function Avatar({ name, size = 'md', online }: { name: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600`}>{initials}</div>
      {online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />}
    </div>
  );
}

function ConvIcon({ conv }: { conv: Conversation }) {
  if (conv.type === 'dept') return (
    <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
      <Hash size={18} className="text-purple-600" />
    </div>
  );
  if (conv.type === 'group') return (
    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Users size={18} className="text-blue-600" />
    </div>
  );
  return <Avatar name={conv.name} online={conv.online} />;
}

export default function ChatPage() {
  const user = useAuthStore(s => s.user);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = CONVERSATIONS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (activeConv) {
      setMessages(MESSAGES[activeConv.id] ?? []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [activeConv]);

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    const msg: Message = {
      id: `m${Date.now()}`, senderId: 'me', senderName: user?.name ?? 'Me',
      content: input.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), isMe: true,
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 overflow-hidden rounded-xl border border-[#E2E0DC] bg-white">
      {/* Conversations sidebar */}
      <div className={`flex flex-col border-r border-[#E2E0DC] ${activeConv ? 'hidden md:flex w-72 lg:w-80' : 'flex w-full md:w-72 lg:w-80'}`}>
        <div className="p-4 border-b border-[#E2E0DC]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#1A1A1A] text-lg">Chats</h2>
            <button className="p-1.5 rounded-lg hover:bg-gray-100"><Plus size={18} className="text-[#757575]" /></button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-2 bg-[#F8F7F4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:bg-white border border-transparent focus:border-orange-300 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <button key={conv.id} onClick={() => setActiveConv(conv)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-[#F8F7F4] transition-colors text-left border-b border-[#F0EEE9] ${activeConv?.id === conv.id ? 'bg-orange-50' : ''}`}>
              <ConvIcon conv={conv} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium truncate ${!conv.unread ? 'text-[#1A1A1A]' : 'text-[#1A1A1A] font-semibold'}`}>{conv.name}</p>
                  <span className="text-xs text-[#ABABAB] flex-shrink-0 ml-1">{conv.lastTime}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-xs truncate ${conv.unread ? 'text-[#1A1A1A] font-medium' : 'text-[#ABABAB]'}`}>{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 min-w-[1.25rem] h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center px-1">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between p-3 border-b border-[#E2E0DC] bg-white">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveConv(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
              <ConvIcon conv={activeConv} />
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">{activeConv.name}</p>
                <p className="text-xs text-[#757575]">
                  {activeConv.type === 'dm'
                    ? (activeConv.online ? 'Online' : 'Offline')
                    : `${activeConv.members} members`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {activeConv.type === 'dm' && <>
                <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Voice call"><Phone size={16} className="text-[#757575]" /></button>
                <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Video call"><Video size={16} className="text-[#757575]" /></button>
              </>}
              <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Info"><Info size={16} className="text-[#757575]" /></button>
              <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="More options"><MoreHorizontal size={16} className="text-[#757575]" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF8]">
            {messages.map((msg, i) => {
              const isMe = msg.isMe;
              const showAvatar = !isMe && (i === 0 || messages[i-1]?.senderId !== msg.senderId);
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <div className={`w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                      {msg.senderName.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[70%] space-y-0.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && !isMe && <p className="text-xs text-[#ABABAB] ml-1">{msg.senderName}</p>}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white border border-[#E2E0DC] text-[#1A1A1A] rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    <p className="text-xs text-[#ABABAB] mx-1">{msg.time}</p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                  <ConvIcon conv={activeConv} />
                </div>
                <p className="font-medium text-[#1A1A1A]">{activeConv.name}</p>
                <p className="text-sm text-[#757575] mt-1">Start the conversation</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-[#E2E0DC] bg-white">
            <div className="flex items-center gap-2 bg-[#F8F7F4] rounded-2xl px-3 py-1.5 border border-[#E2E0DC] focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0" aria-label="Attach file"><Paperclip size={16} className="text-[#757575]" /></button>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Message ${activeConv.name}...`}
                className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-[#ABABAB] focus:outline-none"
              />
              <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0" aria-label="Emoji"><Smile size={16} className="text-[#757575]" /></button>
              {input.trim() ? (
                <button onClick={sendMessage} className="p-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex-shrink-0" aria-label="Send">
                  <Send size={15} className="text-white" />
                </button>
              ) : (
                <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0" aria-label="Voice message">
                  <span className="text-[#757575] text-sm">🎙</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center bg-[#FAFAF8]">
          <div>
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-orange-300" />
            </div>
            <p className="font-semibold text-[#1A1A1A]">Select a conversation</p>
            <p className="text-sm text-[#757575] mt-1">Choose from your chats on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}

