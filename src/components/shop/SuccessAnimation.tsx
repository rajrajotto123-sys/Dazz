import { motion } from 'motion/react';
import { CheckCircle2, FileText, Download, Home, ShoppingBag, ClipboardList } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface SuccessAnimationProps {
  order: Order;
  onClose: () => void;
  onTraceOrder: (invoiceId: string) => void;
}

export default function SuccessAnimation({ order, onClose, onTraceOrder }: SuccessAnimationProps) {
  const downloadReceipt = () => {
    const text = `
-----------------------------------------
      INZARA PROTOCOL RECEIPT
-----------------------------------------
Order ID: ${order.id}
Invoice: ${order.invoiceId}
Date: ${new Date().toLocaleString()}

Customer: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}

Items:
${order.products.map(p => `- ${p.productName} (x${p.quantity}): ${formatCurrency(p.price * p.quantity)}`).join('\n')}

Total Amount: ${formatCurrency(order.totalAmount)}
Status: ${order.status}
-----------------------------------------
      AUTH: ARCHIVAL_ACCESS_01
-----------------------------------------
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INV-${order.invoiceId}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-card bg-[#0a0a0c]/90 border border-white/10 p-10 text-center space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-cyber-green animate-pulse shadow-[0_0_20px_rgba(57,255,20,1)]" />

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-cyber-green/10 rounded-[32px] flex items-center justify-center border border-cyber-green/20 relative"
        >
          <div className="absolute inset-0 bg-cyber-green/10 blur-xl rounded-full" />
          <CheckCircle2 className="w-12 h-12 text-cyber-green relative z-10" />
        </motion.div>

        <div>
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Order Sealed</h2>
           <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-2">Protocol: Confirmation_Successful</p>
        </div>

        <div className="space-y-4 text-left">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Master Invoice</span>
              <span className="font-mono text-cyber-blue font-bold">{order.invoiceId}</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Archive Summary</span>
              {order.products.map((p, i) => (
                <div key={i} className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">{p.productName} <span className="opacity-30">x{p.quantity}</span></span>
                  <span className="text-white/80 tabular-nums">{formatCurrency(p.price * p.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-between items-end">
               <span className="text-[10px] text-white/30 font-black uppercase tracking-widest pb-1">Settled Amount</span>
               <span className="text-2xl font-black text-cyber-green drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            onClick={() => onTraceOrder(order.id)}
            className="h-14 bg-cyber-blue text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-5 h-5" />
            Trace
          </button>
          <button 
            onClick={onClose}
            className="h-14 bg-white/5 text-white/60 font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all border border-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>
        
        <button 
          onClick={downloadReceipt}
          className="w-full h-12 flex items-center justify-center gap-2 text-white/20 hover:text-white transition-colors group mt-2"
        >
          <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Protocol Receipt Download</span>
        </button>
      </motion.div>
    </div>
  );
}
