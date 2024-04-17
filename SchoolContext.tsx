// SchoolContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of the context value
type SchoolContextType = {
  school: any; // Update the type based on your school data structure
  login: (schoolData: any) => void;
  logout: () => void;
};

// Provide a default value for the context
export const SchoolContext = createContext<SchoolContextType>({
  school: null,
  login: () => {},
  logout: () => {},
});

interface SchoolProviderProps {
  children: ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const [school, setSchool] = useState<any>(null);

  const login = (schoolData: any) => {
    setSchool(schoolData);
  };

  const logout = () => {
    setSchool(null);
  };

  return (
    <SchoolContext.Provider value={{ school, login, logout }}>
      {children}
    </SchoolContext.Provider>
  );
};
