import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Phone, Video, MoreVertical, ShieldCheck, ShieldAlert } from 'lucide-react';
import { MOCK_CHATS } from '../constants';
import { ChatSession, Message } from '../types';
import { analyzeChatSafety } from '../services/openaiService';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { subscribeToChats, subscribeToMessages, sendMessage } from '../services/chatService'; // Import Service
import SmartImage from './SmartImage';

interface ChatTabProps {
  initialChatId?: string | null;
}

const ChatTab: React.FC<ChatTabProps> = ({ initialChatId }) => {
  const { currentUser } = useAuth();
  const [allChats, setAllChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]); // Real messages state
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Safety State
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'risk' | 'checking'>('safe');
  const [safetyReason, setSafetyReason] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to handle external chat selection (e.g. from HomeTab)
  useEffect(() => {
    if (initialChatId) {
      setSelectedChatId(initialChatId);
    }
  }, [initialChatId]);

  const selectedChat = allChats.find(c => c.id === selectedChatId) ||
    (selectedChatId ? { id: selectedChatId, userName: 'Loading...', userAvatar: '', unreadCount: 0, messages: [], participants: [] } as any : null);

  if (!currentUser) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>Please log in to view messages.</p>
      </div>
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Subscribe to Chat List
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToChats(currentUser.uid, (chats) => {
      setAllChats(chats);
      setConnectionError(null);
    }, (error) => {
      console.error("Chat Subscription Error:", error);
      if (error.message.includes("requires an index")) {
        setConnectionError("Missing Index: Click the link in console to fix.");
      } else {
        setConnectionError("Failed to load chats. Check console.");
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to Messages for Selected Chat
  useEffect(() => {
    if (!selectedChatId) return;
    const unsubscribe = subscribeToMessages(selectedChatId, (msgs) => {
      console.log("ChatTab: Received messages", msgs.length);
      // Mark messages as 'me' or 'them'
      const processedMsgs = msgs.map(m => ({
        ...m,
        isMe: m.senderId === currentUser?.uid
      }));
      setMessages(processedMsgs);
    });
    return () => unsubscribe();
  }, [selectedChatId, currentUser]);

  useEffect(() => {
    if (selectedChatId) scrollToBottom();
  }, [messages, isTyping, selectedChatId]);

  // Safety Check (Updated to use real messages)
  useEffect(() => {
    if (selectedChatId && messages.length > 0) {
      const msgTexts = messages.map(m => `${m.isMe ? 'User' : 'Partner'}: ${m.text}`);
      if (msgTexts.length > 0) {
        setSafetyStatus('checking');
        const timeout = setTimeout(async () => {
          const result = await analyzeChatSafety(msgTexts.slice(-5));
          setSafetyStatus(result.safe ? 'safe' : 'risk');
          setSafetyReason(result.reason);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [messages, selectedChatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !currentUser) return;

    try {
      setNewMessage('');
      await sendMessage(selectedChatId, currentUser.uid, newMessage);
    } catch (e) {
      console.error("Failed to send", e);
      alert("Failed to send message");
    }
  };

  // Main Chat List View
  if (!selectedChat) {
    return (
      <div className="w-full h-full max-w-3xl mx-auto flex flex-col bg-white dark:bg-dark-card md:border-x md:border-gray-200 dark:md:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>

        {connectionError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border-b border-red-100 dark:border-red-800">
            ⚠ {connectionError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {allChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition-colors"
            >
              <div className="relative">
                <img src={chat.userAvatar} alt={chat.userName} className="w-14 h-14 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                {chat.unreadCount > 0 && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-electric-blue border-2 border-white dark:border-dark-card rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{chat.userName}</h3>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{chat.timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-electric-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Individual Conversation View
  return (
    <div className="w-full h-[calc(100vh-144px)] md:h-[calc(100vh-64px)] max-w-3xl mx-auto flex flex-col bg-white dark:bg-dark-card md:border-x md:border-gray-200 dark:md:border-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/90 dark:bg-dark-card/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedChatId(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft size={24} />
          </button>
          <SmartImage src={selectedChat.userAvatar} alt={selectedChat.userName} itemTitle={selectedChat.userName} category="Avatar" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{selectedChat.userName}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-green-500 font-medium">Online</span>
              {safetyStatus === 'risk' && <span className="text-[10px] text-red-500 font-bold px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 rounded ml-2">⚠️ Safety Alert</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-electric-blue">
          <div title={safetyStatus === 'risk' ? safetyReason : "Chat Monitored by AI"} className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${safetyStatus === 'risk' ? 'bg-red-50 text-red-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
            {safetyStatus === 'checking' ? (
              <span className="animate-pulse">Scanning...</span>
            ) : safetyStatus === 'risk' ? (
              <><ShieldAlert size={14} /> Risk Detected</>
            ) : (
              <><ShieldCheck size={14} /> Secure</>
            )}
          </div>
          <button className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"><Phone size={20} /></button>
          <button className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"><Video size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bg">
        {safetyStatus === 'risk' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl text-xs text-red-700 dark:text-red-300 mb-4 animate-in slide-in-from-top-5">
            <span className="font-bold">Safety Warning:</span> {safetyReason || "Potential policy violation detected."}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.isMe
                ? 'bg-electric-blue text-white rounded-tr-none'
                : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                }`}
            >
              {msg.text}
              <span className={`text-[10px] block mt-1 text-right ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button
            onClick={handleSendMessage}
            className={`p-2 rounded-full transition-all ${newMessage.trim() ? 'bg-electric-blue text-white shadow-md' : 'text-gray-400'}`}
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;