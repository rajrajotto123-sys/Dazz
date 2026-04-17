import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isLarge?: boolean;
  key?: string | number;
}

export default function ProductCard({ product, onAddToCart, onBuyNow, isLarge }: ProductCardProps) {
  if (isLarge) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="glass-card bg-[#1c1c1e] p-6 space-y-4 group cursor-pointer border-white/5 hover:border-white/20 transition-all duration-500"
      >
        <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden bg-black">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <p className="text-white font-bold text-sm tracking-tight">{formatCurrency(product.price)}</p>
          </div>
        </div>
        
        <div className="space-y-4 flex justify-between items-end">
          <div className="min-w-0 pr-4">
            <h3 className="text-xl font-bold font-display truncate text-white uppercase tracking-tight">{product.name}</h3>
            <p className="text-sm text-white/40 font-medium line-clamp-1 mt-1">{product.description}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="h-14 w-14 glass-button flex items-center justify-center text-white/60 hover:text-white active:scale-90 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}
              className="h-14 px-8 bg-white text-black font-bold rounded-2xl active:scale-90 transition-transform shadow-[0_4px_24px_rgba(255,255,255,0.2)]"
            >
              Buy
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-[#1c1c1e] rounded-[28px] p-4 flex gap-4 items-center group cursor-pointer border border-white/5 hover:border-white/10 transition-all"
    >
      <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-black flex-shrink-0 border border-white/5">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-base truncate text-white">{product.name}</h4>
        <p className="text-cyber-blue font-bold tracking-tight text-sm mt-0.5">{formatCurrency(product.price)}</p>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        className="w-12 h-12 glass-button flex items-center justify-center text-white/40 hover:text-white"
      >
        <Plus className="w-6 h-6" />
      </button>
    </motion.div>
  );
}
