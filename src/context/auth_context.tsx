import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authData: any;
  login: (values: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authData: null,
  login: () => {},
  logout: () => {},
});

const LOCAL_STORAGE_KEY = "authData";

export const AuthProvider = ({ children }: { children: any }) => {
  const [authData, setAuthData] = useState<any>(null);

  // Load from localStorage on first render
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      setAuthData(JSON.parse(storedData));
    }
  }, []);

  const login = (values: any) => {
    setAuthData(values);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
  };

  const logout = () => {
    setAuthData(null);
    // localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
