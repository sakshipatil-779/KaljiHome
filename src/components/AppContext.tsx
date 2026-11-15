'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, ElderProfile, CareMembership } from '@/types';

interface AppContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  currentProfile: ElderProfile;
  membership: CareMembership | null;
  refreshKey: number;
  triggerRefresh: () => void;
  activeNotification: string | null;
  showNotification: (msg: string) => void;
}

const DEFAULT_PROFILE: ElderProfile = {
  id: 'prof_meera',
  preferred_name: 'Meera Sharma',
  timezone: 'Asia/Kolkata',
  preferred_language: 'en',
  contact_email: 'meera@example.com',
  emergency_contact_name: 'Arjun Sharma (Son)',
  emergency_contact_phone: '+91 98200 12345',
  owner_user_id: 'usr_meera',
  created_by_user_id: 'usr_meera',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_USER: User = {
  id: 'usr_meera',
  email: 'meera@example.com',
  display_name: 'Meera Sharma',
  role_title: 'Older Adult & Profile Owner',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ElderProfile>(DEFAULT_PROFILE);
  const [membership, setMembership] = useState<CareMembership | null>(null);
  const [refreshKey, setRefreshKey] = useState(1);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  useEffect(() => {
    // Load available users
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setAvailableUsers(data.users);
          const meera = data.users.find((u: User) => u.id === 'usr_meera') || data.users[0];
          setCurrentUser(meera);
        }
      })
      .catch((err) => console.error('Failed to load users', err));
  }, []);

  const switchUser = (userId: string) => {
    const selected = availableUsers.find((u) => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      showNotification(`Switched active view to: ${selected.display_name} (${selected.role_title || selected.email})`);
      setRefreshKey((k) => k + 1);
    }
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const showNotification = useCallback((msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification((current) => (current === msg ? null : current));
    }, 4500);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        availableUsers,
        currentProfile,
        membership,
        refreshKey,
        triggerRefresh,
        activeNotification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
