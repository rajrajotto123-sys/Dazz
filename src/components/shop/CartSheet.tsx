import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { OrderItem } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: OrderItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
  standalone?: boolean;
}

export default function CartSheet({ isOpen, onClose, cart, onRemove, onUpdateQty, onCheckout, standalone }: CartSheetProps) {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const content = (
    <div className={cn(
      "flex flex-col h-full bg-[#0a0a0c]/80 backdrop-blur-3xl",
      standalone ? "rounded-[40px] border border-white/5 overflow-hidden" : "w-full max-w-md fixed right-0 top-0 bottom-0 z-[60] border-l border-white/10"
    )}>
      <div className="p-8 flex justify-between items-center bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyber-purple/10 flex items-center justify-center border border-cyber-purple/20">
            <ShoppingBag className="w-5 h-5 text-cyber-purple" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Cart</h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-none mt-0.5">Inventory Selection</p>
          </div>
        </div>
        {!standalone && (
          <button 
            onClick={onClose}
            className="w-10 h-10 glass-button flex items-center justify-center text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20">
            <ShoppingBag className="w-16 h-16" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">Empty</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.productId} className="flex gap-5 group">
              <div className="w-24 h-24 rounded-[28px] overflow-hidden bg-black flex-shrink-0 border border-white/5">
                <img 
                  src={item.imageUrl} 
                  alt={item.productName} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-white text-lg leading-tight truncate">{item.productName}</h4>
                  <p className="text-cyber-green font-bold text-sm tracking-tight">{formatCurrency(item.price)}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-1.5 border border-white/5">
                    <button 
                      onClick={() => onUpdateQty(item.productId, -1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black text-white min-w-[20px] text-center tabular-nums">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQty(item.productId, 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => onRemove(item.productId)}
                    className="w-8 h-8 flex items-center justify-center text-red-500/30 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-8 space-y-6 bg-white/5 border-t border-white/5">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Subtotal</p>
              <p className="text-3xl font-black text-white tabular-nums">{formatCurrency(total)}</p>
            </div>
            <button 
              onClick={onCheckout}
              className="px-8 h-16 bg-white text-black font-black uppercase tracking-widest rounded-[22px] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (standalone) return content;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[60] w-full"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
