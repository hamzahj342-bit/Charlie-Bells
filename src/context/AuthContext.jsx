import { createContext, useContext, useReducer, useEffect } from 'react';
import { themeApi } from '../services/themeApi';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload?.user || null,
        token: action.payload?.token || null,
        error: null
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };

    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null
      };

    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Save token and user data to localStorage whenever they change
  useEffect(() => {
    console.log('AuthContext - localStorage save effect triggered');
    console.log('AuthContext - state.token:', state.token ? 'exists' : 'null');
    console.log('AuthContext - state.user:', state.user ? 'exists' : 'null');
    
    if (state.token && state.user) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      console.log('AuthContext - Data saved to localStorage');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('AuthContext - Data removed from localStorage');
    }
  }, [state.token, state.user]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await themeApi.login({ email, password });
      
      console.log('AuthContext - Login response:', response);
      console.log('AuthContext - About to dispatch LOGIN_SUCCESS');
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response?.user,
          token: response?.token
        }
      });

      console.log('AuthContext - Login success dispatched');
      return response;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.error || error.message
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      await themeApi.register(userData);
      
      dispatch({ type: 'REGISTER_SUCCESS' });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.response?.data?.error || error.message
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await themeApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
