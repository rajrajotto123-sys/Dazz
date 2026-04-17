import React from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export default function ProductList({ products, onAddToCart, onBuyNow }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center border border-white/10 animate-pulse">
          <Search className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Archiving Inventory...</p>
      </div>
    );
  }

  const largeProducts = products.slice(0, 1);
  const regularProducts = products.slice(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 px-2">
        {largeProducts.map(p => (
          <ProductCard 
            key={p.id} 
            product={p} 
            onAddToCart={onAddToCart} 
            onBuyNow={onBuyNow} 
            isLarge 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-2">
        {regularProducts.map(p => (
          <ProductCard 
            key={p.id} 
            product={p} 
            onAddToCart={onAddToCart} 
            onBuyNow={onBuyNow} 
          />
        ))}
      </div>
    </div>
  );
}
