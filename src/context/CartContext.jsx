import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', cost: 250 },
  // { id: 'express', label: 'Express Delivery', cost: 500 },
];

const FREE_SHIPPING_THRESHOLD = 10000;

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
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
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state.items, state.isOpen, state.shippingMethod]);

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
    const isValid = SHIPPING_OPTIONS.some((o) => o.id === methodId);
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

  const getShippingCost = (subtotal, methodId = state.shippingMethod) => {
    if (!subtotal || Number.isNaN(Number(subtotal))) return 0;
    if (Number(subtotal) >= FREE_SHIPPING_THRESHOLD) return 0;

    const selected = SHIPPING_OPTIONS.find((o) => o.id === methodId) || SHIPPING_OPTIONS[0];
    return selected.cost;
  };

  const value = {
    ...state,
    shippingOptions: SHIPPING_OPTIONS,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
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
