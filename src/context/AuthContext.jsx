import { createContext, useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (error) {
      console.error('Error loading saved auth data:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    // Save to state
    setUser(userData);
    setToken(userToken);
    setLoading(false);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);
    } catch (error) {
      console.error('Error saving auth data to localStorage:', error);
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    setLoading(false);
    
    // Clear localStorage
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error clearing auth data from localStorage:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Initializing app..." />;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
