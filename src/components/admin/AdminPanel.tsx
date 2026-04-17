import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  Package, 
  ListOrdered, 
  Settings as SettingsIcon, 
  Lock, 
  LogIn, 
  LogOut, 
  X,
  Image as ImageIcon,
  Upload,
  ShieldCheck
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { Product, Order, Settings, BannerImage } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';

interface AdminPanelProps {
  settings: Settings;
}

export default function AdminPanel({ settings }: AdminPanelProps) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('admin_access') === 'true';
  });
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'settings'>('orders');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = settings.adminPass || 'admin123';
    if (passInput === correctPass) {
      setIsUnlocked(true);
      sessionStorage.setItem('admin_access', 'true');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const logout = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('admin_access');
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 glass-card bg-[#111114] text-center space-y-8 animate-float">
        <div className="mx-auto w-24 h-24 bg-cyber-purple/10 rounded-[32px] flex items-center justify-center border border-cyber-purple/20">
          <Lock className={cn("w-10 h-10 text-cyber-purple transition-all duration-300", error && "text-red-500 scale-110")} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Terminal Locked</h2>
          <p className="text-white/30 text-sm leading-relaxed">Enter administrative passcode to initialize node.</p>
        </div>
        <form onSubmit={handleUnlock} className="space-y-4">
          <input 
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="ACCESS CODE"
            className={cn(
              "admin-input text-center tracking-[0.4em] font-black",
              error && "border-red-500/50 bg-red-500/5 animate-shake"
            )}
            autoFocus
          />
          <button 
            type="submit"
            className="w-full h-16 glass-button bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 rounded-[24px]"
          >
            <LogIn className="w-5 h-5" />
            Initialize Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto px-4">
      <div className="flex justify-between items-center bg-[#1c1c1e] p-5 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ring-2 ring-cyber-blue/20">
            <ShieldCheck className="text-cyber-blue w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-0.5">Terminal Active</p>
            <p className="font-bold text-white text-lg italic">ADMIN NODE</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-12 h-12 glass-button text-white/30 hover:text-cyber-pink hover:bg-cyber-pink/10"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex bg-[#1c1c1e] p-2 rounded-[28px] border border-white/5 overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'orders', label: 'Orders', icon: ListOrdered },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'settings', label: 'System', icon: SettingsIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all flex-grow",
              activeSubTab === tab.id 
                ? "bg-cyber-blue text-black shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeSubTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'products' && <ProductManager />}
          {activeSubTab === 'orders' && <OrderManager />}
          {activeSubTab === 'settings' && <SettingsManager settings={settings} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', imageUrl: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setFormData({ 
      name: p.name, 
      description: p.description, 
      price: p.price.toString(), 
      imageUrl: p.imageUrl 
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), data);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'products'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this record from inventory?')) return;
    try { await deleteDoc(doc(db, 'products', id)); }
    catch (err) { handleFirestoreError(err, OperationType.DELETE, 'products'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-bold text-white uppercase tracking-widest">{editingId ? 'Modify Record' : 'Stock Control'}</h3>
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            isAdding ? "bg-white/10 text-white" : "bg-cyber-blue text-black shadow-lg shadow-cyber-blue/20"
          )}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit} 
            className="glass-card bg-[#1c1c1e] p-6 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Product Name" className="admin-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="number" step="0.01" placeholder="Price" className="admin-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            
            <div className="flex gap-3">
               <input 
                type="text" 
                required 
                placeholder="Image URL or Upload..." 
                className="admin-input flex-grow" 
                value={formData.imageUrl} 
                onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 shrink-0 glass-button flex items-center justify-center text-cyber-blue"
              >
                <Upload className="w-6 h-6" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            {formData.imageUrl && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/5 relative group">
                <img src={formData.imageUrl} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, imageUrl: ''})}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <textarea required placeholder="Description" rows={3} className="admin-input resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <button 
              disabled={isSaving}
              type="submit" 
              className="w-full h-16 bg-white text-black font-bold rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {isSaving ? 'Processing Gateway...' : editingId ? 'Commit Update' : 'Initialize Product'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-[#1c1c1e] rounded-[28px] p-5 flex gap-5 items-center border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-black flex-shrink-0">
              <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-white truncate text-lg">{p.name}</h4>
              <p className="text-cyber-blue font-bold tracking-tight">{formatCurrency(p.price)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(p)} className="w-12 h-12 glass-button text-cyber-blue/50 hover:text-cyber-blue hover:bg-cyber-blue/10">
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="w-12 h-12 glass-button text-red-500/50 hover:text-red-500 hover:bg-red-500/10">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    return onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    try { await updateDoc(doc(db, 'orders', id), { status }); }
    catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'orders'); }
  };

  const filteredOrders = orders.filter(o => 
    o.invoiceId.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        <input 
          placeholder="Lookup Invoice or Customer..." 
          className="w-full admin-input pl-14"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredOrders.map(o => (
          <div key={o.id} className="bg-[#1c1c1e] rounded-[32px] p-6 space-y-5 border border-white/5">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1 group-hover:text-cyber-blue">#{o.invoiceId}</p>
                <h4 className="text-xl font-bold text-white truncate">{o.customerName}</h4>
                <p className="text-sm text-white/40 mt-1 font-medium">{o.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyber-green tabular-nums">{formatCurrency(o.totalAmount)}</p>
                <select 
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value as any)}
                  className={cn(
                    "mt-3 px-4 py-2 rounded-xl text-xs font-bold border outline-none appearance-none cursor-pointer text-center min-w-[100px]",
                    o.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    o.status === 'Confirmed' ? "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20" :
                    "bg-cyber-pink/10 text-cyber-pink border-cyber-pink/20"
                  )}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-black/20 rounded-[20px] p-5 space-y-2">
              {o.products.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/60 font-medium">{p.productName} <span className="text-white/20 text-xs ml-1">x{p.quantity}</span></span>
                  <span className="text-white/80 font-bold">{formatCurrency(p.price * p.quantity)}</span>
                </div>
              ))}
              {(o.customerSize || o.customerColor) && (
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[10px] uppercase font-bold tracking-widest text-white/30">
                  {o.customerSize && <span>Size: <span className="text-cyber-blue ml-1">{o.customerSize}</span></span>}
                  {o.customerColor && <span>Color: <span className="text-cyber-blue ml-1">{o.customerColor}</span></span>}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
               <span className="text-[10px] text-white/40 font-bold uppercase truncate max-w-[150px]">{o.customerAddress}</span>
               <button 
                  onClick={() => {
                    const text = `INVOICE: ${o.invoiceId}\nDATE: ${new Date(o.createdAt as any).toLocaleString()}\nNAME: ${o.customerName}\nTOTAL: ${o.totalAmount}\nSTATUS: ${o.status}`;
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `INV-${o.invoiceId}.txt`;
                    a.click();
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-cyber-blue hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Receipt
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsManager({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings);
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(settings);
    return onSnapshot(query(collection(db, 'banners'), orderBy('order', 'asc')), (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as BannerImage)));
    });
  }, [settings]);

  const saveInfo = async () => {
    setIsSaving(true);
    try { 
      await setDoc(doc(db, 'settings', 'config'), { ...form }, { merge: true }); 
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'settings'); }
    finally { setIsSaving(false); }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await addDoc(collection(db, 'banners'), { 
            url: reader.result as string, 
            order: banners.length, 
            createdAt: serverTimestamp() 
          });
        } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'banners'); }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteBanner = async (id: string) => {
    try { await deleteDoc(doc(db, 'banners', id)); }
    catch (err) { handleFirestoreError(err, OperationType.DELETE, 'banners'); }
  };

  const saveBannerText = async (id: string, text: string) => {
    try { await updateDoc(doc(db, 'banners', id), { text }); }
    catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'banners'); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1c1c1e] rounded-[32px] p-8 space-y-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-cyber-purple" />
          <h3 className="text-xl font-bold text-white uppercase tracking-widest">System Info</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Phone Line</label>
            <input placeholder="+1 234 567 890" className="admin-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Email Relay</label>
            <input placeholder="support@inzara.com" className="admin-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Node Address</label>
            <textarea placeholder="Main Distribution Hub..." rows={2} className="admin-input resize-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Admin Passcode</label>
            <input type="password" placeholder="Terminal Password" className="admin-input" value={form.adminPass || ''} onChange={e => setForm({...form, adminPass: e.target.value})} />
          </div>
        </div>
        <button 
          onClick={saveInfo} 
          disabled={isSaving}
          className={cn(
            "w-full h-16 text-white font-bold rounded-[22px] active:scale-[0.98] transition-all shadow-xl",
            showSuccess ? "bg-cyber-green shadow-cyber-green/20" : "bg-cyber-purple shadow-cyber-purple/10",
            isSaving && "opacity-50 cursor-wait"
          )}
        >
          {isSaving ? 'Synchronizing Nodes...' : showSuccess ? 'Config Committed' : 'Commit Changes'}
        </button>
      </div>

      <div className="bg-[#1c1c1e] rounded-[32px] p-8 space-y-6 border border-white/5">
        <div className="flex items-center gap-3">
           <ImageIcon className="w-6 h-6 text-cyber-blue" />
           <h3 className="text-xl font-bold text-white uppercase tracking-widest">Visual Assets</h3>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => bannerFileInputRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-white/10 rounded-[28px] flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyber-blue group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white/40">Select Local Banner Frame</p>
          </button>
          <input type="file" ref={bannerFileInputRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />

          <div className="grid grid-cols-1 gap-4">
            {banners.map(b => (
              <div key={b.id} className="relative group rounded-[28px] overflow-hidden bg-black border border-white/5 p-4 flex gap-4 items-center">
                <div className="w-24 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={b.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow flex flex-col gap-2">
                  <div className="relative group/input">
                    <input 
                      placeholder="Visual Active Text..." 
                      className="admin-input h-12 py-0 text-sm pr-12 focus:border-cyber-blue" 
                      defaultValue={b.text || ''} 
                      onBlur={e => saveBannerText(b.id, e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/10 group-focus-within/input:text-cyber-blue uppercase tracking-widest transition-colors">
                      Auto-Save
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Frame {b.order + 1}</span>
                    <button 
                      onClick={() => deleteBanner(b.id)}
                      className="text-cyber-pink/50 hover:text-cyber-pink transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                      Purge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
