import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { themeApi } from '../services/themeApi';

const CartContext = createContext();

const DEFAULT_SHIPPING = {
  standard_cost: 10,
  free_threshold: 100,
  label: 'Standard Delivery',
  tax_rate_percent: 8.3,
  tax_rate: 0.083,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload
      };

    case 'SET_CART_ITEMS':
      return {
        ...state,
        items: action.payload
      };

    case 'SET_SHIPPING_METHOD':
      return {
        ...state,
        shippingMethod: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    shippingMethod: 'standard'
  });
  const [shippingConfig, setShippingConfig] = useState(DEFAULT_SHIPPING);

  const refreshShippingSettings = useCallback(async () => {
    try {
      const data = await themeApi.getShippingSettings();
      if (data?.shipping) {
        const cost = Number(data.shipping.standard_cost);
        const threshold = Number(data.shipping.free_threshold);
        const taxPercent = Number(data.shipping.tax_rate_percent);
        const taxRate = Number(data.shipping.tax_rate);
        // Use Number.isFinite — do NOT use `|| fallback` (0 is a valid free-shipping rate)
        const safeCost = Number.isFinite(cost) && cost >= 0 ? cost : DEFAULT_SHIPPING.standard_cost;
        const safeThreshold =
          Number.isFinite(threshold) && threshold >= 0 ? threshold : DEFAULT_SHIPPING.free_threshold;
        const safePercent =
          Number.isFinite(taxPercent) && taxPercent >= 0 && taxPercent <= 100
            ? taxPercent
            : DEFAULT_SHIPPING.tax_rate_percent;
        setShippingConfig({
          standard_cost: safeCost,
          free_threshold: safeThreshold,
          label: data.shipping.label || DEFAULT_SHIPPING.label,
          tax_rate_percent: safePercent,
          tax_rate: Number.isFinite(taxRate) && taxRate >= 0 ? taxRate : safePercent / 100,
        });
      }
    } catch (error) {
      console.warn('Using default shipping rates:', error.message);
      setShippingConfig(DEFAULT_SHIPPING);
    }
  }, []);

  useEffect(() => {
    refreshShippingSettings();
  }, [refreshShippingSettings]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart?.items) {
          dispatch({ type: 'SET_CART_ITEMS', payload: parsedCart.items });
        }
        if (parsedCart?.shippingMethod) {
          dispatch({ type: 'SET_SHIPPING_METHOD', payload: parsedCart.shippingMethod });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      shippingMethod: state.shippingMethod,
    }));
  }, [state.items, state.shippingMethod]);

  const shippingOptions = [
    {
      id: 'standard',
      label: shippingConfig.label,
      cost: shippingConfig.standard_cost,
    },
  ];

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setCartOpen = (isOpen) => {
    dispatch({ type: 'SET_CART_OPEN', payload: isOpen });
  };

  const setShippingMethod = (methodId) => {
    const isValid = shippingOptions.some((o) => o.id === methodId);
    dispatch({
      type: 'SET_SHIPPING_METHOD',
      payload: isValid ? methodId : 'standard'
    });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getShippingCost = (subtotal) => {
    if (!subtotal || Number.isNaN(Number(subtotal))) return 0;
    if (Number(subtotal) >= shippingConfig.free_threshold) return 0;
    return shippingConfig.standard_cost;
  };

  const value = {
    ...state,
    shippingOptions,
    freeShippingThreshold: shippingConfig.free_threshold,
    taxRate: shippingConfig.tax_rate,
    taxRatePercent: shippingConfig.tax_rate_percent,
    shippingConfig,
    refreshShippingSettings,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    setShippingMethod,
    getCartTotal,
    getCartItemsCount,
    getShippingCost
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
