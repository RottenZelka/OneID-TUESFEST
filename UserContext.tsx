// UserContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of the context value
type UserContextType = {
  user: any; // Update the type based on your user data structure
  login: (userData: any) => void;
  logout: () => void;
};

// Provide a default value for the context
export const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
