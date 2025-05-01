import { createContext, useContext, useState } from "react";

interface AuthContextType {
  authData: any;
  login: (values: any) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  authData: null,
  login: () => {},
  logout: () => {},
});

// Create the provider
export const AuthProvider = ({ children }: { children: any }) => {
  const [authData, setAuthData] = useState(null); // Store login values

  const login = (values: any) => {
    setAuthData(values); // Save login info (e.g., token, username, etc.)
  };

  const logout = () => {
    setAuthData(null);
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => useContext(AuthContext);
