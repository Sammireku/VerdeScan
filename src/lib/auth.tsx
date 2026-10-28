// Authentication & User Profile Management with Dexie/localStorage persistence
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'grower' | 'agronomist' | 'hobbyist';
  location: string;
  primaryCrops: string[];
  createdAt: string;
}

const STORAGE_KEY = 'verdescan_current_user';
const USERS_LIST_KEY = 'verdescan_users_db';

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'user-ryan',
    name: 'Ryan Schentzer',
    email: 'ryan@verdescan.org',
    role: 'grower',
    location: 'Greater Accra, Ghana',
    primaryCrops: ['tomato', 'pepper', 'maize'],
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'user-kofi',
    name: 'Kofi Mensah',
    email: 'kofi@verdescan.org',
    role: 'grower',
    location: 'Kumasi, Ashanti Region',
    primaryCrops: ['cassava', 'plantain', 'cocoa'],
    createdAt: '2025-02-01T09:30:00Z',
  },
  {
    id: 'user-ama',
    name: 'Dr. Ama Osei',
    email: 'ama.osei@agri-extension.gov',
    role: 'agronomist',
    location: 'Tamale, Northern Region',
    primaryCrops: ['maize', 'sorghum', 'cowpea'],
    createdAt: '2024-11-20T11:00:00Z',
  },
];

interface AuthContextType {
  currentUser: UserAccount | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signUp: (data: { name: string; email: string; location?: string; role?: 'grower' | 'agronomist' | 'hobbyist'; crops?: string[] }) => Promise<boolean>;
  signOut: () => void;
  switchUser: (userId: string) => void;
  availableUsers: UserAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserAccount[]>(DEMO_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsersRaw = localStorage.getItem(USERS_LIST_KEY);
      let users = DEMO_USERS;
      if (storedUsersRaw) {
        const parsed = JSON.parse(storedUsersRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          users = parsed;
        }
      } else {
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(DEMO_USERS));
      }
      setAvailableUsers(users);

      const activeUserRaw = localStorage.getItem(STORAGE_KEY);
      if (activeUserRaw) {
        setCurrentUser(JSON.parse(activeUserRaw));
      } else {
        // Default to Ryan Schentzer as matching the UI mockup
        setCurrentUser(users[0]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users[0]));
      }
    } catch {
      setCurrentUser(DEMO_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string): Promise<boolean> => {
    const trimmed = email.toLowerCase().trim();
    let found = availableUsers.find((u) => u.email.toLowerCase() === trimmed);
    if (!found) {
      // Create account on-the-fly for smooth user testing
      const namePart = trimmed.split('@')[0];
      const autoName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      found = {
        id: `user-${Date.now()}`,
        name: autoName,
        email: trimmed,
        role: 'grower',
        location: 'Field Garden',
        primaryCrops: ['tomato', 'pepper'],
        createdAt: new Date().toISOString(),
      };
      const updated = [...availableUsers, found];
      setAvailableUsers(updated);
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updated));
    }

    setCurrentUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return true;
  };

  const signUp = async (data: {
    name: string;
    email: string;
    location?: string;
    role?: 'grower' | 'agronomist' | 'hobbyist';
    crops?: string[];
  }): Promise<boolean> => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      location: data.location || 'Greater Accra, Ghana',
      role: data.role || 'grower',
      primaryCrops: data.crops || ['tomato', 'maize'],
      createdAt: new Date().toISOString(),
    };

    const updated = [...availableUsers.filter((u) => u.email !== newUser.email), newUser];
    setAvailableUsers(updated);
    setCurrentUser(newUser);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchUser = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        switchUser,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
