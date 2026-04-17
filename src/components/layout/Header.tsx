import { ShoppingBag, Info, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onInfoClick: () => void;
  onCartClick: () => void;
  cartCount: number;
  isAdmin?: boolean;
  onAdminClick: () => void;
}

export default function Header({ onInfoClick, onCartClick, cartCount, isAdmin, onAdminClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-6 py-6 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-white/5">
      <button 
        onClick={onInfoClick}
        className="w-12 h-12 glass-button flex items-center justify-center text-white/50 hover:text-white"
      >
        <Info className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center">
        <h1 className="text-xl font-black uppercase tracking-[0.3em] bg-gradient-to-r from-cyber-blue via-white to-cyber-purple bg-clip-text text-transparent">
          Inzara
        </h1>
        <div className="h-[2px] w-8 bg-cyber-blue mt-1 blur-[1px] opacity-50" />
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <button 
            onClick={onAdminClick}
            className="w-12 h-12 glass-button flex items-center justify-center text-cyber-purple/60 hover:text-cyber-purple shadow-[0_0_15px_rgba(157,0,255,0.2)]"
          >
            <ShieldCheck className="w-6 h-6" />
          </button>
        )}
        <button 
          onClick={onCartClick}
          className="relative w-12 h-12 glass-button flex items-center justify-center text-white/50 hover:text-white"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black font-black text-[10px] shadow-[0_4px_12px_rgba(255,255,255,0.4)]">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
