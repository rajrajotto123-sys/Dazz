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
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
    { id: 'status', icon: ClipboardList, label: 'Orders' },
    { id: 'admin', icon: ShieldCheck, label: 'Admin' },
  ] as const;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-lg">
      <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex flex-col items-center justify-center py-3 px-5 transition-all duration-500 group rounded-[24px] flex-1",
              activeTab === tab.id ? "text-cyber-blue" : "text-white/20 hover:text-white/40"
            )}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-bg"
                className="absolute inset-0 bg-white/5 rounded-[24px]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative">
              <tab.icon className={cn(
                "w-6 h-6 transition-all duration-500 relative z-10",
                activeTab === tab.id ? "scale-110 stroke-[2.5px] drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]" : "stroke-[1.5px]"
              )} />
              
              <AnimatePresence>
                {'badge' in tab && tab.badge > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 bg-cyber-pink text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black shadow-[0_4px_10px_rgba(255,0,229,0.4)] z-20"
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 transition-all duration-500 relative z-10",
              activeTab === tab.id ? "opacity-100" : "opacity-0 h-0"
            )}>
              {tab.label}
            </span>

            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-dot"
                className="absolute -bottom-1 w-1 h-1 bg-cyber-blue rounded-full shadow-[0_0_10px_rgba(0,242,255,1)]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
