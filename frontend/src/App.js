import React, { useState, useEffect, useMemo } from 'react';
import { Home, ShoppingCart, User, Search, X, Plus, Minus, Star, Heart, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

// --- Zustand Store (Estado Global para Carrito y Favoritos) ---
const appStore = create((set) => ({
  cart: [],
  favorites: ['p1'], // 'p1' es un producto popular por defecto
  addToCart: (product, quantity = 1) => set((state) => {
    const existingItem = state.cart.find((item) => item.id === product.id);
    if (existingItem) {
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity }] };
  }),
  updateCartQuantity: (productId, newQuantity) => set((state) => {
    if (newQuantity < 1) {
      return { cart: state.cart.filter((item) => item.id !== productId) };
    }
    return {
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ),
    };
  }),
  toggleFavorite: (productId) => set((state) => ({
    favorites: state.favorites.includes(productId)
      ? state.favorites.filter((id) => id !== productId)
      : [...state.favorites, productId],
  })),
}));

// --- MOCK DATA (Datos de ejemplo con productos locales) ---
const mockRestaurant = {
  name: 'DUO Previa',
  logoUrl: 'https://placehold.co/100x100/dc2626/f9fafb?text=DUO',
  heroImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2564&auto=format&fit=crop', // Imagen de hamburguesa
};

const mockCategories = [
  { id: 'cat1', name: 'Lomitos', icon: '' },
  { id: 'cat2', name: 'Hamburguesas', icon: '' },
  { id: 'cat3', name: 'Empanadas', icon: '' },
  { id: 'cat4', name: 'Bebidas', icon: '' },
];

const mockProducts = [
  { id: 'p1', name: 'Lomito Clásico', description: 'Tierna carne de lomo, lechuga, tomate, huevo y mayonesa de la casa.', price: 15500, image: 'https://placehold.co/600x400/cccccc/333333?text=Lomito', categoryId: 'cat1', popular: true, rating: 4.9 },
  { id: 'p2', name: 'Hamburguesa DUO', description: 'Doble medallón de carne, queso cheddar, panceta crocante, y salsa DUO.', price: 14000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop', categoryId: 'cat2', popular: true, rating: 4.8 },
  { id: 'p3', name: 'Empanada de Carne', description: 'Jugosa carne cortada a cuchillo, con la receta tradicional cordobesa.', price: 1800, image: 'https://images.unsplash.com/photo-1628323283129-3f4942995f49?q=80&w=2070&auto=format&fit=crop', categoryId: 'cat3', rating: 4.7 },
  { id: 'p4', name: 'Lomito Veggie', description: 'Berenjenas grilladas, queso, vegetales salteados y pan de papa.', price: 13000, image: 'https://placehold.co/600x400/cccccc/333333?text=Lomito+Veggie', categoryId: 'cat1', rating: 4.6 },
  { id: 'p5', name: 'Coca-Cola 500ml', description: 'Botella de 500ml, bien fría.', price: 2000, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32a2ea7?q=80&w=1974&auto=format&fit=crop', categoryId: 'cat4', rating: 4.5 },
];

// --- COMPONENTES DE UI REFINADOS ---

const BottomNav = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'cart', icon: ShoppingCart, label: 'Carrito' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];
  const cart = appStore((state) => state.cart);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center h-20 max-w-md mx-auto">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className="flex flex-col items-center justify-center gap-1 w-20 transition-colors duration-300 text-gray-500 hover:text-red-600 relative"
            whileTap={{ scale: 0.9 }}
          >
            <div className={`p-2 rounded-full transition-all ${activeView === item.id ? 'bg-red-100' : ''}`}>
              {item.id === 'cart' && cart.length > 0 && (
                <motion.div
                  className="absolute top-1 right-3.5 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </motion.div>
              )}
              <item.icon className={`w-6 h-6 transition-colors ${activeView === item.id ? 'text-red-600' : ''}`} />
            </div>
            <span className={`text-xs font-semibold transition-colors ${activeView === item.id ? 'text-red-600' : ''}`}>{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

const Header = () => (
  <div className="p-4 pt-6 bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Pedir en</p>
        <h1 className="font-bold text-xl text-gray-800 flex items-center">DUO Previa</h1>
      </div>
      <img src={mockRestaurant.logoUrl} alt="DUO Previa Logo" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
    </div>
  </div>
);

const ProductCard = ({ product, onSelect }) => {
  const toggleFavorite = appStore((state) => state.toggleFavorite);
  const addToCart = appStore((state) => state.addToCart);
  const favorites = appStore((state) => state.favorites);
  const isFavorite = favorites.includes(product.id);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl shadow-md shadow-gray-200/50 overflow-hidden flex flex-col relative cursor-pointer"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
        <motion.button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/70 rounded-full backdrop-blur-sm"
          whileTap={{ scale: 0.8 }}
        >
          <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
        </motion.button>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-gray-800 flex-grow">{product.name}</h3>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xl font-black text-gray-900">${product.price.toLocaleString('es-AR')}</p>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-sm text-gray-700">{product.rating}</span>
          </div>
        </div>
      </div>
      <motion.button
        onClick={handleAddToCart}
        className="absolute bottom-4 right-4 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
};

const Sheet = ({ children, isOpen, onClose, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-50 w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex-shrink-0 relative text-center">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
              <h2 className="text-xl font-bold">{title}</h2>
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
            <div className="overflow-y-auto flex-grow">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProductDetailSheet = ({ product, isOpen, onClose }) => {
  const addToCart = appStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  if (!product) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="">
      <img src={product.image} alt={product.name} className="w-full h-60 object-cover" />
      <div className="p-6 pb-32">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold text-gray-900 max-w-xs">{product.name}</h2>
          <div className="flex items-center gap-1 text-amber-500 bg-white px-3 py-1.5 rounded-full shadow-md">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold text-lg">{product.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed my-4">{product.description}</p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 border-t border-gray-200 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-3 bg-gray-200 rounded-full hover:bg-gray-300"
              whileTap={{ scale: 0.9 }}
            >
              <Minus className="w-5 h-5" />
            </motion.button>
            <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
            <motion.button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-3 bg-gray-200 rounded-full hover:bg-gray-300"
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          <motion.button
            onClick={handleAddToCart}
            className="bg-red-600 text-white font-bold py-4 px-6 rounded-full hover:bg-red-700 shadow-lg shadow-red-300/50 flex-grow ml-6"
            whileTap={{ scale: 0.95 }}
          >
            Agregar ${ (product.price * quantity).toLocaleString('es-AR') }
          </motion.button>
        </div>
      </div>
    </Sheet>
  );
};

// --- VISTAS PRINCIPALES (PANTALLAS) ---

const HomeScreen = ({ onProductSelect }) => {
  const [activeCategory, setActiveCategory] = useState(mockCategories[0].id);
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => p.categoryId === activeCategory);
  }, [activeCategory]);

  return (
    <div>
      <Header />
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar lomitos, hamburguesas..."
            className="w-full bg-gray-100 border border-gray-200 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </div>

      <div className="py-2">
        <ul className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar">
          {mockCategories.map((cat) => (
            <motion.li key={cat.id} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-full font-semibold transition-all flex items-center gap-2.5 text-sm ${
                  activeCategory === cat.id ? 'bg-red-600 text-white shadow-md shadow-red-300/50' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Populares de la Semana</h2>
        <div className="grid grid-cols-2 gap-4">
          {mockProducts.filter((p) => p.popular).map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onProductSelect} />
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Menú Completo</h2>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onProductSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CartScreen = ({ onBack, onCheckout }) => {
  const cart = appStore((state) => state.cart);
  const updateCartQuantity = appStore((state) => state.updateCartQuantity);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const deliveryFee = 1500; // Ejemplo
  const total = subtotal + deliveryFee;

  return (
    <div>
      <div className="p-4 pt-6 bg-white sticky top-0 z-10 border-b flex items-center gap-4 shadow-sm">
        <motion.button onClick={onBack} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}>
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <h1 className="text-2xl font-bold">Mi Carrito</h1>
      </div>

      {cart.length === 0 ? (
        <motion.div
          className="p-6 text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
          <p className="text-gray-500 mt-2">Agregá tus productos favoritos para empezar a pedir.</p>
        </motion.div>
      ) : (
        <div className="p-4 pb-48">
          <ul className="space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.li
                  key={item.id}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="font-black text-red-600 mt-1">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-2 bg-gray-100 rounded-full"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="font-bold text-lg">{item.quantity}</span>
                    <motion.button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-2 bg-gray-100 rounded-full"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-8 p-4 bg-white rounded-2xl shadow-md space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span> <span className="font-medium">${subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span> <span className="font-medium">${deliveryFee.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-2 pt-3 border-t border-gray-100">
              <span>Total</span> <span>${total.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <motion.div
          className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 border-t backdrop-blur-sm"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.button
            onClick={onCheckout}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-full hover:bg-green-600 shadow-lg shadow-green-300/50 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-5 h-5" />
            Finalizar pedido por WhatsApp
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

const ProfileScreen = () => (
  <motion.div
    className="p-4 pt-6 h-screen flex flex-col items-center justify-center text-center bg-gray-50"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <User className="w-24 h-24 text-gray-300 mb-4" />
    <h2 className="text-2xl font-bold">Mi Perfil</h2>
    <p className="text-gray-500 mt-2 max-w-xs">Aquí podrás ver tu información, direcciones y pedidos anteriores.</p>
  </motion.div>
);

// --- COMPONENTE PRINCIPAL DE LA APP ---
export default function DuoPreviaApp() {
  const [activeView, setActiveView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const cart = appStore((state) => state.cart);

  const handleCheckout = () => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + 1500;
    let message = `¡Hola DUO Previa!  Quiero hacer un pedido:\n\n`;
    cart.forEach((item) => {
      message += `* ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
    });
    message += `\n*Total (con envío): $${total.toLocaleString('es-AR')}*`;
    message += `\n\n_Por favor, confirmame el pedido y decime cómo seguimos._`;

    const whatsappUrl = `https://wa.me/5493510000000?text=${encodeURIComponent(message)}`; // Reemplazar con el número real
    window.open(whatsappUrl, '_blank');
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeScreen onProductSelect={setSelectedProduct} />;
      case 'cart':
        return <CartScreen onBack={() => setActiveView('home')} onCheckout={handleCheckout} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onProductSelect={setSelectedProduct} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-md mx-auto border-x border-gray-100 pb-20 selection:bg-red-200">
      {renderView()}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      <ProductDetailSheet product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
