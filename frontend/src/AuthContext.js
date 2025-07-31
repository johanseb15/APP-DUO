import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "./api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.adminMe();
      setAdmin(response.data);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.adminLogin(email, password);
      const { access_token, admin: adminData } = response.data;
      
      setToken(access_token);
      setAdmin(adminData);
      localStorage.setItem('adminToken', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };