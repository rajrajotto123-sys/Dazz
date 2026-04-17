import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Mail, MapPin } from 'lucide-react';
import { Settings } from '../../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
}

export default function InfoModal({ isOpen, onClose, settings }: InfoModalProps) {
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
            initial={{ opacity: 0, scale: 0.8, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm"
          >
            <div className="modal-content">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Brand Info</h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Dazzling Inzara</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 glass-button flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Contact</p>
                    <p className="text-base font-medium text-white">{settings.phone || 'Not available'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-cyber-blue/20 flex items-center justify-center text-cyber-blue group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Support</p>
                    <p className="text-base font-medium text-white truncate">{settings.email || 'Not available'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-cyber-green/20 flex items-center justify-center text-cyber-green group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-sm font-medium text-white leading-relaxed">{settings.address || 'Not available'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 text-center relative">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium relative z-10">
                  &copy; {new Date().getFullYear()} Dazzling Inzara
                </p>
                {/* Secret admin access door */}
                <div 
                  onClick={() => {
                     onClose();
                     window.dispatchEvent(new CustomEvent('open-admin'));
                  }}
                  className="absolute inset-x-0 bottom-0 h-10 cursor-alias opacity-0"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
