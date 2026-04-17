import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Home, 
  ClipboardList, 
  Info, 
  X,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { Product, Order, Settings, BannerImage, OrderItem } from './types';
import { cn, formatCurrency } from './lib/utils';

// Components
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import ProductList from './components/shop/ProductList';
import CartSheet from './components/shop/CartSheet';
import OrderStatus from './components/shop/OrderStatus';
import InfoModal from './components/layout/InfoModal';
import Banner from './components/shop/Banner';
import AdminPanel from './components/admin/AdminPanel';
import CheckoutForm from './components/shop/CheckoutForm';
import SuccessAnimation from './components/shop/SuccessAnimation';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'status' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({
    phone: '',
    email: '',
    address: '',
    bannerEnabled: true
  });
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<Product | 'cart' | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [tracingInvoiceId, setTracingInvoiceId] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      }
    );

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      }
    });

    const unsubBanners = onSnapshot(
      query(collection(db, 'banners'), orderBy('order', 'asc')),
      (snapshot) => {
        setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BannerImage)));
      }
    );

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const handleOpenAdmin = () => setActiveTab('admin');
    window.addEventListener('open-admin', handleOpenAdmin);

    return () => {
      unsubProducts();
      unsubSettings();
      unsubBanners();
      unsubAuth();
      window.removeEventListener('open-admin', handleOpenAdmin);
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen pb-40 relative bg-black selection:bg-cyber-blue/20 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyber-blue/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyber-purple/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />

      <Header 
        onInfoClick={() => setIsInfoOpen(true)} 
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
        isAdmin={user?.email === 'rajrajotto123@gmail.com'}
        onAdminClick={() => setActiveTab('admin')}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="px-2">
                {banners.length > 0 && (
                  <Banner images={banners} />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-xl font-black text-white tracking-widest uppercase">Catalogue</h2>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-blue shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  </div>
                </div>
                <ProductList 
                  products={products} 
                  onAddToCart={addToCart} 
                  onBuyNow={(p) => setIsCheckoutOpen(p)}
                />
              </div>
            </motion.div>
          )}

          {(activeTab === 'status' || activeTab === 'cart') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="max-w-2xl mx-auto">
                {activeTab === 'status' ? (
                  <OrderStatus initialInvoiceId={tracingInvoiceId || undefined} />
                ) : (
                  <div className="pt-10">
                    <CartSheet 
                      isOpen={true} 
                      onClose={() => setActiveTab('home')} 
                      cart={cart}
                      onRemove={removeFromCart}
                      onUpdateQty={updateQuantity}
                      onCheckout={() => setIsCheckoutOpen('cart')}
                      standalone
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminPanel settings={settings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav 
        activeTab={activeTab === 'cart' ? 'cart' : activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cartCount}
      />

      <InfoModal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
        settings={settings}
      />

      <CartSheet 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
        onCheckout={() => setIsCheckoutOpen('cart')}
      />

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutForm 
            items={isCheckoutOpen === 'cart' ? cart : [{
              productId: isCheckoutOpen.id,
              productName: isCheckoutOpen.name,
              price: isCheckoutOpen.price,
              quantity: 1,
              imageUrl: isCheckoutOpen.imageUrl
            }]} 
            onClose={() => setIsCheckoutOpen(null)}
            onSuccess={(order) => {
              setLastOrder(order);
              setIsCheckoutOpen(null);
              if (isCheckoutOpen === 'cart') clearCart();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastOrder && (
          <SuccessAnimation 
            order={lastOrder} 
            onClose={() => setLastOrder(null)} 
            onTraceOrder={(id) => {
              setTracingInvoiceId(id);
              setActiveTab('status');
              setLastOrder(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
