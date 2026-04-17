import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Order } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';

interface OrderStatusProps {
  initialInvoiceId?: string;
}

export default function OrderStatus({ initialInvoiceId }: OrderStatusProps) {
  const [orderId, setOrderId] = useState(initialInvoiceId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (initialInvoiceId) {
      setOrderId(initialInvoiceId);
      performSearch(initialInvoiceId);
    }
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [initialInvoiceId]);

  const performSearch = (id: string) => {
    const trimmedId = id.trim();
    if (!trimmedId) return;

    // Clear previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setIsSearching(true);
    setOrder(null);
    setError(null);

    try {
      const docRef = doc(db, 'orders', trimmedId);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        setIsSearching(false);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
          setError(null);
        } else {
          setOrder(null);
          setError('Order archive not found. Please verify your ID.');
        }
      }, (err) => {
        setIsSearching(false);
        setError('Signal lost. An error occurred while fetching the order data.');
        handleFirestoreError(err, OperationType.GET, 'orders');
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      setIsSearching(false);
      setError('Connection failure. Please try again.');
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(orderId);
  };

  const statusColors = {
    Pending: 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/30',
    Confirmed: 'text-cyber-green bg-cyber-green/10 border-cyber-green/30',
    Cancelled: 'text-cyber-pink bg-cyber-pink/10 border-cyber-pink/30',
  };

  const statusIcons = {
    Pending: <Clock className="w-12 h-12" />,
    Confirmed: <CheckCircle className="w-12 h-12" />,
    Cancelled: <XCircle className="w-12 h-12" />,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-8 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold font-display text-cyber-purple tracking-tighter">ORDER STATUS</h2>
        <p className="text-white/40 italic">Track your package across the galaxy</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input 
          required
          placeholder="Enter Order ID (e.g. Inv...)"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-12 focus:ring-4 focus:ring-cyber-purple/20 focus:border-cyber-purple outline-none transition-all text-xl font-mono text-center tracking-widest"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-cyber-purple transition-colors" />
        <button 
          type="submit" 
          disabled={isSearching}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass-button' bg-cyber-purple text-white rounded-xl disabled:opacity-50"
        >
          {isSearching ? '...' : <ChevronRight />}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {order ? (
          <motion.div
            key="order-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card glow-border p-8 border-cyber-purple/20 space-y-6"
          >
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-black/40 border border-white/5">
              <div className={cn("p-6 rounded-full mb-4 shadow-[0_0_30px_currentcolor]", statusColors[order.status])}>
                {statusIcons[order.status]}
              </div>
              <h3 className={cn("text-3xl font-bold font-display mb-2", statusColors[order.status].split(' ')[0])}>
                STATUS: {order.status.toUpperCase()}
              </h3>
              <p className="text-white/40 font-mono tracking-widest">INVOICE: {order.invoiceId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 glass-card bg-white/5 border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Customer</p>
                <p className="text-lg font-medium">{order.customerName}</p>
              </div>
              <div className="p-4 glass-card bg-white/5 border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-lg font-bold text-cyber-green">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-white/40 uppercase tracking-widest px-1">Order Items</p>
              {order.products.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-4 glass-card bg-white/5 border-white/5">
                  <div className="flex gap-4 items-center">
                    <img src={item.imageUrl} className="w-10 h-10 rounded object-cover" />
                    <span className="font-medium">{item.productName}</span>
                  </div>
                  <span className="text-white/40">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glow-border p-8 border-cyber-pink/20 bg-cyber-pink/5 flex flex-col items-center text-center gap-4"
          >
            <AlertCircle className="w-12 h-12 text-cyber-pink" />
            <p className="text-cyber-pink font-bold">{error}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Helper component for Search button
function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}
