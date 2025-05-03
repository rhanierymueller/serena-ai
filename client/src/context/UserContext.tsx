import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser, saveUser, clearUser, UserProfile } from '../services/userSession';
import { checkAuth } from '../services/userService';

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
  logout: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(getUser());

  const setUser = (user: UserProfile | null) => {
    setUserState(user);
    if (user) {
      saveUser(user);
    } else {
      clearUser();
    }
  };

  const refreshUser = async () => {
    const userData = await checkAuth();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
