import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Phone, MapPin, Ruler, Palette, FileText } from 'lucide-react';
import { OrderItem, Order } from '../../types';
import { formatCurrency, generateOrderId } from '../../lib/utils';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CheckoutFormProps {
  items: OrderItem[];
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export default function CheckoutForm({ items, onClose, onSuccess }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    size: '',
    color: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use short 8-character ID for both Firestore ID and invoiceId
      const invoiceId = generateOrderId();
      const docRef = doc(db, 'orders', invoiceId);

      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerSize: formData.size || '',
        customerColor: formData.color || '',
        products: items,
        totalAmount: total,
        status: 'Pending',
        invoiceId, // Now matches docRef.id
        createdAt: serverTimestamp()
      };

      await setDoc(docRef, orderData);
      
      // Construct local order object for animation
      onSuccess({ 
        id: invoiceId, 
        ...orderData,
        createdAt: new Date().toISOString() // Local approximation for immediate UI
      } as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-lg glass-card bg-[#0a0a0c]/90 border border-white/[0.08] rounded-[40px] p-8 md:p-10 shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] max-h-[95vh] overflow-y-auto no-scrollbar"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink opacity-50" />
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Checkout</h2>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Order Authorization Required</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 glass-button flex items-center justify-center text-white/40">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8 space-y-4 max-h-[160px] overflow-y-auto no-scrollbar pr-2">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black">
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.productName}</p>
                <p className="text-[10px] text-cyber-blue font-black uppercase tracking-widest">{item.quantity} Unit{item.quantity > 1 ? 's' : ''}</p>
              </div>
              <p className="text-sm font-bold text-white/80 tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyber-blue transition-colors" />
              <input required placeholder="Client Name" className="admin-input pl-14" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyber-blue transition-colors" />
              <input required placeholder="Client Liaison" className="admin-input pl-14" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <Ruler className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyber-blue transition-colors" />
              <input placeholder="Size Ref" className="admin-input pl-14" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
            </div>
            <div className="relative group">
              <Palette className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyber-blue transition-colors" />
              <input placeholder="Tone Ref" className="admin-input pl-14" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
            </div>
          </div>

          <div className="relative group">
            <MapPin className="absolute left-5 top-5 w-5 h-5 text-white/20 group-focus-within:text-cyber-blue transition-colors" />
            <textarea required placeholder="Deployment Address" rows={2} className="admin-input pl-14 py-4 resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-6 md:p-8 rounded-[32px] border border-white/5 gap-6">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Final Settlement</p>
                <p className="text-4xl font-black text-cyber-green tabular-nums drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]">{formatCurrency(total)}</p>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="h-16 px-12 bg-white text-black font-black uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_4px_32px_rgba(255,255,255,0.25)] flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                {isSubmitting ? 'Verifying...' : 'Authorize Order'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
