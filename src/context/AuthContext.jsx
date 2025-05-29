// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Pastikan token belum kadaluarsa
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          // Asumsikan data pengguna ada di dalam payload token (misalnya decodedToken.email, decodedToken.name)
          setUser({
            id: decodedToken.id, // Sesuaikan dengan key di token Anda
            email: decodedToken.email, // Sesuaikan dengan key di token Anda
            name: decodedToken.name || 'User', // Sesuaikan
            profilePic: decodedToken.profilePic || "https://via.placeholder.com/150/00859D/FFFFFF?text=PP"
          });
        } else {
          // Token kadaluarsa
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => { // Menerima token dari SignIn.jsx
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwtDecode(token);
      setIsLoggedIn(true);
      setUser({
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name || 'User',
        profilePic: decodedToken.profilePic || "https://picsum.photos/150/150"
      });
    } catch (error) {
      console.error("Error decoding token on login:", error);
      // Jika gagal decode, set sebagai tidak login
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};