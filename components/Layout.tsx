import React, { ReactNode, useState } from 'react';
import { Bell, Home, Map as MapIcon, User, Plus, Moon, Sun, MessageCircle } from 'lucide-react';
import { Tab, Notification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../constants';

interface LayoutProps {
  children: ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onFabClick: () => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onFabClick, toggleTheme, isDark }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotifClick = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white flex flex-col transition-colors duration-300">
      
      {/* Responsive Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-dark-card/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center gap-8">
                <h1 className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-electric-vivid drop-shadow-sm cursor-pointer" onClick={() => onTabChange(Tab.HOME)}>
                    Swappr.
                </h1>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    <DesktopNavLink active={activeTab === Tab.HOME} onClick={() => onTabChange(Tab.HOME)} icon={<Home size={18} />} label="Swap" />
                    <DesktopNavLink active={activeTab === Tab.SEARCH} onClick={() => onTabChange(Tab.SEARCH)} icon={<MapIcon size={18} />} label="Search" />
                    <DesktopNavLink active={activeTab === Tab.CHAT} onClick={() => onTabChange(Tab.CHAT)} icon={<MessageCircle size={18} />} label="Chat" />
                    <DesktopNavLink active={activeTab === Tab.PROFILE} onClick={() => onTabChange(Tab.PROFILE)} icon={<User size={18} />} label="Profile" />
                </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    title="Toggle Theme"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="relative">
                    <button onClick={handleNotifClick} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition relative">
                        <Bell size={18} />
                        {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg"></span>
                        )}
                    </button>
                    {showNotifs && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Notifications</h3>
                        {notifications.map(n => (
                            <div key={n.id} className="text-sm p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                            {n.text}
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Desktop List Button */}
                <button 
                    onClick={onFabClick}
                    className="hidden md:flex items-center gap-2 bg-electric-blue hover:bg-electric-dark text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition hover:scale-105 active:scale-95 ml-2"
                >
                    <Plus size={18} />
                    <span>List Item</span>
                </button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      {/* We use min-h-[calc(100vh-64px)] to ensure full height below header */}
      <main className="flex-1 relative w-full flex flex-col">
        <div className="flex-1 w-full pb-20 md:pb-0">
             {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 grid grid-cols-5 items-end pb-2 z-40 px-2">
        <MobileNavButton active={activeTab === Tab.HOME} onClick={() => onTabChange(Tab.HOME)} icon={<Home size={24} />} label="Swap" />
        <MobileNavButton active={activeTab === Tab.SEARCH} onClick={() => onTabChange(Tab.SEARCH)} icon={<MapIcon size={24} />} label="Search" />
        
        {/* Central SELL Action Button */}
        <div className="flex flex-col items-center justify-end h-full relative -top-6">
            <button 
                onClick={onFabClick}
                className="w-14 h-14 rounded-full bg-electric-blue text-white shadow-lg shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-4 border-gray-50 dark:border-dark-bg"
            >
                <Plus size={30} strokeWidth={3} />
            </button>
            <span className="text-[10px] font-bold mt-1 text-gray-400 dark:text-gray-500">Sell</span>
        </div>

        <MobileNavButton active={activeTab === Tab.CHAT} onClick={() => onTabChange(Tab.CHAT)} icon={<MessageCircle size={24} />} label="Chat" />
        <MobileNavButton active={activeTab === Tab.PROFILE} onClick={() => onTabChange(Tab.PROFILE)} icon={<User size={24} />} label="Profile" />
      </nav>
    </div>
  );
};

const DesktopNavLink = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm
            ${active 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-electric-blue' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const MobileNavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center p-2 mb-1 transition-all duration-300 ${active ? 'text-electric-blue' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
    >
        <div className={`transition-transform duration-200 ${active ? '-translate-y-1' : ''}`}>
             {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 2.5 : 2 })}
        </div>
        <span className={`text-[10px] font-bold mt-1 transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
);

export default Layout;