import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Mail, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { Settings } from '../../types';
import FlairFioraLogo from '../common/FlairFioraLogo';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onOpenAdmin?: () => void;
}

export default function InfoModal({ isOpen, onClose, settings, onOpenAdmin }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-overlay"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm"
          >
            <div className="bg-[#121214]/95 backdrop-blur-3xl border border-white/[0.12] rounded-[32px] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-5 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-white/[0.12] to-white/[0.02] border border-white/[0.15] p-1.5 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <FlairFioraLogo className="w-full h-full" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-wide">Brand Directory</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Flair Fiora</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* iOS 18 Tinted App Icon list */}
              <div className="space-y-2.5">
                {/* Contact Card */}
                <div className="p-3.5 rounded-[20px] bg-white/[0.04] border border-white/[0.06] flex items-center gap-3.5 group hover:bg-white/[0.08] transition-all">
                  <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform flex-shrink-0">
                    <Phone className="w-5 h-5 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">Phone line</p>
                    <p className="text-sm font-medium text-white truncate">{settings.phone || '+1 (800) 840-3921'}</p>
                  </div>
                </div>

                {/* Support Card */}
                <div className="p-3.5 rounded-[20px] bg-white/[0.04] border border-white/[0.06] flex items-center gap-3.5 group hover:bg-white/[0.08] transition-all">
                  <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-sky-500/20 to-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform flex-shrink-0">
                    <Mail className="w-5 h-5 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[9px] font-bold text-sky-400/80 uppercase tracking-widest">Email Relay</p>
                    <p className="text-sm font-medium text-white truncate">{settings.email || 'support@flairfiora.com'}</p>
                  </div>
                </div>

                {/* Location Card */}
                <div className="p-3.5 rounded-[20px] bg-white/[0.04] border border-white/[0.06] flex items-center gap-3.5 group hover:bg-white/[0.08] transition-all">
                  <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-amber-500/20 to-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform flex-shrink-0">
                    <MapPin className="w-5 h-5 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest">Flagship Location</p>
                    <p className="text-sm font-medium text-white leading-tight">{settings.address || 'Tokyo • New York • Paris'}</p>
                  </div>
                </div>

                {/* Admin Terminal Access (Moved from top to here) */}
                <button 
                  onClick={() => {
                    onClose();
                    if (onOpenAdmin) {
                      onOpenAdmin();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-admin'));
                    }
                  }}
                  className="w-full p-3.5 rounded-[20px] bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-950/40 border border-purple-500/30 flex items-center gap-3.5 group hover:border-purple-400/60 hover:bg-purple-900/60 transition-all text-left shadow-[0_4px_20px_rgba(147,51,234,0.15)]"
                >
                  <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-purple-500/30 to-indigo-950/60 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-bold text-purple-300 uppercase tracking-widest">Management</p>
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[8px] font-black uppercase tracking-wider border border-purple-500/30">Admin</span>
                    </div>
                    <p className="text-sm font-bold text-white">Admin Terminal Node</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-medium">
                  &copy; {new Date().getFullYear()} Flair Fiora Boutique
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

