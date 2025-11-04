import { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          // If token exists, fetch current user
          const response = await getCurrentUser();
          
          if (response.data) {
            setUser(response.data);
          } else if (response.user) {
            setUser(response.user);
          }
        } else {
          // No token found
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    // Save tokens to localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Optional: Call logout API if needed
      // await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
