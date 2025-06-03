import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import profile1 from '../assets/profile1.jpg';

// ✅ Pastikan ini ada sebelum dipakai
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
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setToken(savedToken);
          setUser({
            id: decodedToken.id,
            email: decodedToken.email,
            name: decodedToken.name || 'User',
            profilePic: decodedToken.profilePic || profile1,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (receivedToken) => {
    localStorage.setItem('token', receivedToken);
    try {
      const decodedToken = jwtDecode(receivedToken);
      setIsLoggedIn(true);
      setToken(receivedToken);
      setUser({
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name || 'User',
        profilePic: decodedToken.profilePic || "https://picsum.photos/150/150"
      });
    } catch (error) {
      console.error("Error decoding token on login:", error);
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
  return useContext(AuthContext);
};
