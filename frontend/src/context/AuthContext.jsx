import React, { createContext, useState, useEffect, useContext } from 'react';
import  {jwtDecode} from 'jwt-decode';
import profile1 from '../assets/profile1.jpg';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decodedToken = jwtDecode(savedToken);
        console.log("AuthContext: Decoded token from localStorage:", decodedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setToken(savedToken);
          setUser({
            id: decodedToken.id,
            email: decodedToken.email,
            name: decodedToken.name || 'Fallback User from Token', 
            profilePic: decodedToken.profilePic || profile1,
          });
          console.log("AuthContext: User state after initial load:", { 
            id: decodedToken.id,
            email: decodedToken.email,
            name: decodedToken.name || 'Fallback User from Token',
          });
        } else {
          localStorage.removeItem('token');
          console.log("AuthContext: Token expired.");
        }
      } catch (error) {
        console.error("AuthContext: Error decoding token on mount:", error);
        localStorage.removeItem('token');
      }
    } else {
      console.log("AuthContext: No token found on mount.");
    }
    setLoading(false);
  }, []);

  const login = (receivedToken) => {
    localStorage.setItem('token', receivedToken);
    try {
      const decodedToken = jwtDecode(receivedToken);
      console.log("AuthContext: Decoded token after login:", decodedToken);
      setIsLoggedIn(true);
      setToken(receivedToken);
      setUser({
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name || 'Fallback User from Login', 
        profilePic: decodedToken.profilePic || "https://picsum.photos/150/150"
      });
      console.log("AuthContext: User state after successful login:", { 
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name || 'Fallback User from Login',
      });
    } catch (error) {
      console.error("AuthContext: Error decoding token on login:", error);
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    console.log("AuthContext: User logged out.");
  };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};