import { Home, ClipboardList, ShieldCheck, ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface BottomNavProps {
  activeTab: 'home' | 'status' | 'admin' | 'cart';
  setActiveTab: (tab: 'home' | 'status' | 'admin' | 'cart') => void;
  cartCount: number;
}

export default function BottomNav({ activeTab, setActiveTab, cartCount }: BottomNavProps) {
  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Home',
      tint: 'cyan',
      activeColor: 'text-cyan-400',
      activeGlow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
      tileGrad: 'from-cyan-500/25 to-cyan-950/40 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
    },
    { 
      id: 'cart', 
      icon: ShoppingBag, 
      label: 'Cart', 
      badge: cartCount,
      tint: 'purple',
      activeColor: 'text-purple-400',
      activeGlow: 'drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]',
      tileGrad: 'from-purple-500/25 to-purple-950/40 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
    },
    { 
      id: 'status', 
      icon: ClipboardList, 
      label: 'Orders',
      tint: 'amber',
      activeColor: 'text-amber-400',
      activeGlow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]',
      tileGrad: 'from-amber-500/25 to-amber-950/40 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
    },
    { 
      id: 'admin', 
      icon: ShieldCheck, 
      label: 'Admin',
      tint: 'pink',
      activeColor: 'text-pink-400',
      activeGlow: 'drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]',
      tileGrad: 'from-pink-500/25 to-pink-950/40 border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
    },
  ] as const;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-[370px]">
      <div className="bg-[#0e0e11]/90 backdrop-blur-3xl border border-white/[0.12] rounded-[26px] p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-2 transition-all duration-300 group rounded-[20px] flex-1 min-h-[46px]",
                isActive ? tab.activeColor : "text-white/35 hover:text-white/70"
              )}
            >
              {/* iOS 18 squircle tile background */}
              {isActive && (
                <motion.div 
                  layoutId="nav-tile-bg"
                  className={cn(
                    "absolute inset-0.5 rounded-[18px] bg-gradient-to-b border backdrop-blur-md",
                    tab.tileGrad
                  )}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
                />
              )}
              
              <div className="relative z-10 flex items-center justify-center">
                <tab.icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? cn("scale-110 stroke-[2.2px]", tab.activeGlow) : "stroke-[1.7px] group-hover:scale-105"
                )} />
                
                <AnimatePresence>
                  {'badge' in tab && tab.badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black shadow-[0_2px_8px_rgba(244,63,94,0.6)] z-20"
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <span className={cn(
                "text-[8px] font-bold uppercase tracking-[0.14em] mt-1 transition-all duration-300 relative z-10",
                isActive ? "opacity-100 font-black" : "opacity-0 h-0 overflow-hidden"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

