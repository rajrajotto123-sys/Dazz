import { ShoppingBag, Info } from 'lucide-react';
import FlairFioraLogo from '../common/FlairFioraLogo';

interface HeaderProps {
  onInfoClick: () => void;
  onCartClick: () => void;
  cartCount: number;
}

export default function Header({ onInfoClick, onCartClick, cartCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between bg-black/75 backdrop-blur-2xl border-b border-white/[0.08]">
      {/* iOS 18 App Icon Styled Info Button */}
      <button 
        onClick={onInfoClick}
        className="w-11 h-11 rounded-[16px] bg-gradient-to-b from-white/[0.12] to-white/[0.03] border border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95 transition-all duration-300 group"
        aria-label="Brand Information"
      >
        <Info className="w-5 h-5 transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
      </button>

      {/* Brand Identity */}
      <div 
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <FlairFioraLogo className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform duration-300" />
        <div className="flex flex-col items-start">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-[0.22em] sm:tracking-[0.28em] bg-gradient-to-r from-white via-slate-100 to-white/85 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
            Flair Fiora
          </h1>
          <div className="h-[1.5px] w-full bg-gradient-to-r from-cyan-400 via-white/50 to-purple-500 blur-[0.5px] opacity-70" />
        </div>
      </div>

      {/* iOS 18 App Icon Styled Cart Button */}
      <div className="flex items-center">
        <button 
          onClick={onCartClick}
          className="relative w-11 h-11 rounded-[16px] bg-gradient-to-b from-white/[0.12] to-white/[0.03] border border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-purple-400 hover:text-purple-300 hover:border-purple-400/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] active:scale-95 transition-all duration-300 group"
          aria-label="Cart"
        >
          <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] shadow-[0_4px_12px_rgba(244,63,94,0.6)] border border-black/40">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

