import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeTab from './components/HomeTab';
import SearchTab from './components/SearchTab';
import ProfileTab from './components/ProfileTab';
import ChatTab from './components/ChatTab';
import ListModal from './components/ListModal';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Tab, Item, UserProfile } from './types';
import { MOCK_CARDS, INITIAL_PROFILE } from './constants';
import { fetchItems, subscribeToItems, getUserProfile, createUserProfile, updateUserProfile } from './services/firestoreService';

const MainApp: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Load Data from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        // 1. Load Profile
        let profile = await getUserProfile(currentUser.uid);
        if (!profile) {
          profile = await createUserProfile(currentUser.uid, currentUser.email || '');
        }
        setUserProfile(profile);

        // 2. Subscribe to Items (Real-time)
        const unsubscribe = subscribeToItems((updatedItems) => {
          setItems(updatedItems);
        });

        // Cleanup subscription on unmount or user change
        return () => unsubscribe();
      }
    };

    let unsubscribeItems: (() => void) | undefined;

    if (!loading && currentUser) {
      loadData().then(unsub => {
        if (typeof unsub === 'function') {
          unsubscribeItems = unsub;
        }
      });
    }

    return () => {
      if (unsubscribeItems) unsubscribeItems();
    };
  }, [currentUser, loading]);

  // Toggle Body class for global theming
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#0f0f11';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#e0f2fe';
    }
  }, [isDark]);

  const handleAddItem = (newItem: Item) => {
    setItems(prev => [newItem, ...prev]);
  };

  const handleMatch = () => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        sales: prev.sales + 1,
        karma: prev.karma + 50
      };
      if (currentUser) {
        updateUserProfile(currentUser.uid, { sales: updated.sales, karma: updated.karma });
      }
      return updated;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return (
          <HomeTab
            items={items}
            onMatch={handleMatch}
            swaps={userProfile.sales}
            onStartChat={(chatId) => {
              setActiveChatId(chatId);
              setActiveTab(Tab.CHAT);
            }}
          />
        );
      case Tab.SEARCH:
        return <SearchTab items={items} />;
      case Tab.CHAT:
        return <ChatTab initialChatId={activeChatId} />;
      case Tab.PROFILE:
        return <ProfileTab profile={userProfile} onUpdateProfile={setUserProfile} />;
      default:
        return <HomeTab items={items} onMatch={handleMatch} swaps={userProfile.sales} />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">Loading...</div>;
  }

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  if (!currentUser) {
    if (authMode === 'login') {
      return <Login onSwitch={() => setAuthMode('signup')} />;
    } else {
      return <Signup onSwitch={() => setAuthMode('login')} />;
    }
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFabClick={() => setShowListModal(true)}
        toggleTheme={() => setIsDark(!isDark)}
        isDark={isDark}
      >
        {renderContent()}
      </Layout>

      {showListModal && (
        <ListModal
          onClose={() => setShowListModal(false)}
          onAddItem={handleAddItem}
          userProfile={userProfile}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;