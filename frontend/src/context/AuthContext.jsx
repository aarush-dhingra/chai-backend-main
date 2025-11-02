import { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        
        // Set user from response
        if (response.data) {
          setUser(response.data);
        } else if (response.user) {
          setUser(response.user);
        }
      } catch (err) {
        // Not authenticated - that's ok, just stay logged out
        setUser(null);
      } finally {
        // Always finish loading, even if auth check fails
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Only run once on app mount

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call logout API - this clears the cookie on backend
      // await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user on frontend
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
