import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  Crown,
  Shield,
  Truck,
  RefreshCw,
  Gift,
  Sparkles,
  TrendingUp,
  Diamond
} from 'lucide-react';

const Home = () => {
  // Luxury dummy data
  const heroSlides = [
    {
      id: 1,
      title: "Exclusive Luxury Collection",
      subtitle: "Discover Premium Products Crafted for Excellence",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      cta: "Explore Now",
      ctaLink: "/shop"
    },
    {
      id: 2,
      title: "Limited Edition Drops",
      subtitle: "Rare Finds for the Discerning Collector",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200",
      cta: "Discover",
      ctaLink: "/category/limited"
    }
  ];

  const categories = [
    { id: 1, name: "Luxury Collection", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300", count: 245, icon: Crown },
    { id: 2, name: "Premium Essentials", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300", count: 189, icon: Diamond },
    { id: 3, name: "Exclusive Accessories", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300", count: 156, icon: Sparkles },
    { id: 4, name: "Limited Edition", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300", count: 98, icon: TrendingUp },
    { id: 5, name: "Designer Wear", image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300", count: 234, icon: Crown },
    { id: 6, name: "Premium Tech", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300", count: 167, icon: Shield }
  ];

  const trendingProducts = [
    {
      id: 1,
      name: "Luxury Gold Watch",
      price: 2999,
      originalPrice: 3999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
      rating: 4.8,
      reviews: 234,
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Designer Leather Bag",
      price: 1899,
      originalPrice: 2499,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
      rating: 4.9,
      reviews: 189,
      badge: "Exclusive"
    },
    {
      id: 3,
      name: "Premium Silk Scarf",
      price: 599,
      originalPrice: 899,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300",
      rating: 4.7,
      reviews: 156,
      badge: "Limited"
    },
    {
      id: 4,
      name: "Diamond Ring Platinum",
      price: 8999,
      originalPrice: 12999,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300",
      rating: 5.0,
      reviews: 98,
      badge: "Rare"
    }
  ];

  const features = [
    { icon: Crown, title: "Premium Quality", description: "Handcrafted with finest materials" },
    { icon: Shield, title: "Authentic Guaranteed", description: "100% genuine products certified" },
    { icon: Truck, title: "Global Delivery", description: "Worldwide shipping with insurance" },
    { icon: RefreshCw, title: "30-Day Returns", description: "Hassle-free return policy" }
  ];

  const ProductCard = ({ product }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="backdrop-blur-xl bg-slate-800/50 border border-amber-500/20 rounded-2xl overflow-hidden group cursor-pointer"
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-3 py-1 text-xs rounded-full font-bold">
            {product.badge}
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="backdrop-blur-sm bg-slate-900/80 p-2 rounded-full shadow-md hover:bg-amber-500/20 border border-amber-500/30">
            <Heart className="w-4 h-4 text-amber-400" />
          </button>
          <button className="backdrop-blur-sm bg-slate-900/80 p-2 rounded-full shadow-md hover:bg-amber-500/20 border border-amber-500/30">
            <Eye className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-amber-100 mb-2">{product.name}</h3>
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
              />
            ))}
          </div>
          <span className="text-sm text-amber-300 ml-2">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-amber-100">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through ml-2">${product.originalPrice}</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 p-2 rounded-xl hover:from-amber-500 hover:to-amber-700"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="header_section_top">
              <div className="row">
                <div className="col-sm-12">
                  <div className="custom_menu">
                    <ul>
                      <li><a href="/home">Home</a></li>
                      <li><a href="/cart">Cart</a></li>
                      <li><a href="/checkout">Checkout</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent leading-tight">
                Discover
                <br />
                Luxury
                <br />
                Redefined
              </h1>
              <p className="text-xl text-amber-100/80 leading-relaxed">
                Experience the pinnacle of elegance with our exclusive collection of premium products crafted for the discerning connoisseur.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:from-amber-500 hover:to-amber-700 flex items-center justify-center shadow-2xl"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-amber-500/50 text-amber-100 px-8 py-4 rounded-2xl font-bold hover:bg-amber-500/10 backdrop-blur-sm"
                >
                  <Diamond className="w-5 h-5 mr-2" />
                  View Exclusive
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                  alt="Luxury Collection"
                  className="rounded-3xl shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-6 py-3 rounded-2xl font-bold shadow-2xl animate-pulse">
                  <Crown className="w-5 h-5 inline mr-2" />
                  Limited Edition
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <feature.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-purple-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🎨 Shop by Category
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Browse our wide range of kids clothing across different categories
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group border-2 border-purple-100"
              >
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 text-lg">
                    {category.emoji}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-purple-900">{category.name}</h3>
                  <p className="text-sm text-purple-600">{category.count} items</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-12 bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🌟 Trending Products
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Check out our most popular kids clothes this week
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              🛍️ View All Products
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
