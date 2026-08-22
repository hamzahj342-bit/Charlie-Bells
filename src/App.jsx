import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeHome from './pages/ThemeHome';
import About from './pages/About';
import DynamicCategory from './pages/DynamicCategory';
import ThemeProductDetail from './pages/ThemeProductDetail';
// import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import AllProducts from './pages/AllProducts';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LogoProvider } from './context/LogoContext';

// Import theme CSS
import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/theme-fixes.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LogoProvider>
          <Router>
          <div className="App">
            {/* <ThemeNavbar /> */}
            <main>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<ThemeHome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/all-products" element={<AllProducts />} />
                  <Route path="/product/:barcode" element={<ThemeProductDetail />} />
                  {/* <Route path="/product-detail/:id" element={<ProductDetail />} /> */}
                  <Route path="/category/:categorySlug" element={<DynamicCategory />} />
                  <Route path="/:categorySlug" element={<DynamicCategory />} />
                </Routes>
              </AnimatePresence>
            </main>
            {/* <Footer />
            <MiniCart /> */}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ff4b4b',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </LogoProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
