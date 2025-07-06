import { useState, useCallback } from 'react';

export const useProfessionalAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro ao fazer login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);

  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
};