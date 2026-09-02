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
  ShieldCheck,
  Check,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import FlairFioraLogo from '../common/FlairFioraLogo';
import PreOrderBadge from '../common/PreOrderBadge';
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
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ring-2 ring-white/20 p-2.5">
            <FlairFioraLogo className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-0.5">Flair Fiora Terminal</p>
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isPreOrder: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Deletion modal state
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      list.sort((a, b) => {
        const getMillis = (item: Product) => {
          if (!item.createdAt) return 0;
          if (typeof (item.createdAt as any).toMillis === 'function') return (item.createdAt as any).toMillis();
          if (typeof (item.createdAt as any).seconds === 'number') return (item.createdAt as any).seconds * 1000;
          const parsed = new Date(item.createdAt as any).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };
        return getMillis(b) - getMillis(a);
      });
      setProducts(list);
    }, (err) => {
      console.error('Admin products listener error:', err);
    });
  }, []);

  const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // Accept files up to 10 MB and compress gracefully

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMAGE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        reject(new Error(`File size (${sizeMb} MB) is too large. Please select an image under 10 MB.`));
        return;
      }

      // Format validation
      const type = file.type.toLowerCase();
      const validExtension = /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name);
      if (!type.startsWith('image/') && !validExtension) {
        reject(new Error('Unsupported file format. Please upload a JPG, PNG, or WEBP image.'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to parse image data.'));
        img.onload = () => {
          try {
            // Adaptive compression loop ensuring the final base64 string length is safely under 500,000 chars
            // (Firestore maximum document size is 1,048,576 bytes)
            let maxDim = 1200;
            let quality = 0.84;
            let finalDataUrl = '';

            for (let attempt = 0; attempt < 5; attempt++) {
              let width = img.naturalWidth || img.width;
              let height = img.naturalHeight || img.height;

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, width);
              canvas.height = Math.max(1, height);
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                finalDataUrl = reader.result as string;
                break;
              }

              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);

              // Always encode as JPEG for compact size & 100% browser rendering support
              finalDataUrl = canvas.toDataURL('image/jpeg', quality);

              // Safe size for Firestore (under ~400 KB binary)
              if (finalDataUrl.length <= 500000) {
                break;
              }

              // Step down dimension and quality progressively if needed
              maxDim = Math.round(maxDim * 0.8);
              quality = Math.max(0.55, quality - 0.1);
            }

            resolve(finalDataUrl);
          } catch (err: any) {
            reject(new Error(err.message || 'Image processing failed.'));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const processedUrl = await processImageFile(file);
      setFormData(prev => ({ ...prev, imageUrl: processedUrl }));
    } catch (err: any) {
      setImageError(err.message || 'Image upload failed.');
    } finally {
      setIsProcessingImage(false);
      // Reset file input so user can re-select the same file if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', imageUrl: '', isPreOrder: false });
    setIsAdding(false);
    setEditingId(null);
    setImageError(null);
    setSaveError(null);
  };

  const handleEdit = (p: Product) => {
    setFormData({ 
      name: p.name, 
      description: p.description || '', 
      price: (p.price !== undefined && p.price !== null && !isNaN(Number(p.price))) ? p.price.toString() : '', 
      imageUrl: p.imageUrl,
      isPreOrder: Boolean(p.isPreOrder)
    });
    setEditingId(p.id);
    setIsAdding(true);
    setImageError(null);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSaveError('Product name is required.');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setSaveError('Product image is required.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    // Optional price calculation: if empty, store null. No mandatory validation!
    const parsedPrice = formData.price.trim() !== '' && !isNaN(parseFloat(formData.price))
      ? parseFloat(formData.price)
      : null;

    try {
      const data: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parsedPrice,
        imageUrl: formData.imageUrl.trim(),
        isPreOrder: Boolean(formData.isPreOrder),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), data);
        setSaveSuccess(`"${formData.name.trim()}" updated successfully!`);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
        setSaveSuccess(`"${formData.name.trim()}" added and published to store!`);
      }
      setTimeout(() => setSaveSuccess(null), 4000);
      resetForm();
    } catch (err: any) { 
      console.error('Error saving product:', err);
      setSaveError(err.message || 'Error saving product to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (p: Product) => {
    setDeleteError(null);
    setDeleteCandidate(p);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // Execute permanent database delete
      await deleteDoc(doc(db, 'products', deleteCandidate.id));
      const deletedName = deleteCandidate.name;
      setDeleteCandidate(null);
      setDeleteSuccess(`"${deletedName}" permanently deleted from database.`);
      setTimeout(() => setDeleteSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to permanently delete product:', err);
      setDeleteError(err.message || 'Database deletion failed. Please check network connection and try again.');
      handleFirestoreError(err, OperationType.DELETE, 'products');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{saveSuccess}</span>
          </motion.div>
        )}
        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{deleteSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-widest">{editingId ? 'Modify Record' : 'Stock Control'}</h3>
          <p className="text-xs text-white/40 mt-0.5">{products.length} Products in Inventory</p>
        </div>
        <button 
          onClick={() => isAdding ? resetForm() : setIsAdding(true)}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            isAdding ? "bg-white/10 text-white" : "bg-cyber-blue text-black shadow-lg shadow-cyber-blue/20 hover:scale-105 active:scale-95"
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
            className="glass-card bg-[#1c1c1e] p-6 space-y-5 overflow-hidden border border-white/10 rounded-[32px]"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingId ? 'Edit Product Details' : 'New Product Registration'}
              </h4>
              <button 
                type="button" 
                onClick={resetForm} 
                className="text-white/40 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Product Name *</label>
                <input 
                  required 
                  placeholder="e.g. Cybernetic Silk Scarf" 
                  className="admin-input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Price in BDT (Optional)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="Leave blank for no price" 
                  className="admin-input" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>
            </div>

            {/* Pre-Order Toggle */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white">Pre-Order Feature</span>
                  {formData.isPreOrder ? (
                    <PreOrderBadge size="sm" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-1">
                  {formData.isPreOrder
                    ? 'Active: Shows red animated PRE-ORDER label beside product price'
                    : 'Inactive: Product displayed normally without pre-order badge'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPreOrder: !prev.isPreOrder }))}
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  formData.isPreOrder ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-white/10"
                )}
                aria-label="Toggle Pre-Order"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    formData.isPreOrder ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            
            {/* Image Upload Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Product Image *</label>
                <span className="text-[10px] text-white/30">JPG, PNG, WEBP (Max 2 MB)</span>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  required 
                  placeholder="Paste Image URL or click Upload button..." 
                  className="admin-input flex-grow" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                />
                <button 
                  type="button"
                  disabled={isProcessingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 shrink-0 glass-button flex items-center justify-center text-cyber-blue hover:text-white transition-all disabled:opacity-50"
                  title="Upload Image (Max 2 MB)"
                >
                  {isProcessingImage ? <Loader2 className="w-6 h-6 animate-spin text-cyber-blue" /> : <Upload className="w-6 h-6" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                />
              </div>

              {/* Explicit Image Error Display */}
              {imageError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>

            {formData.imageUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/10 relative group bg-black">
                <img src={formData.imageUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white/80">Image Ready</span>
                  {formData.isPreOrder && <PreOrderBadge size="sm" />}
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, imageUrl: ''})}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Description</label>
              <textarea 
                placeholder="Details, materials, sizing guidelines..." 
                rows={3} 
                className="admin-input resize-none" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <button 
              disabled={isSaving || isProcessingImage}
              type="submit" 
              className={cn(
                "w-full h-16 font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                saveError ? "bg-red-500 text-white" : "bg-white text-black hover:bg-white/90 shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : saveError ? (
                <span>{saveError}</span>
              ) : (
                <span>{editingId ? 'Commit Changes' : 'Publish Product to Store'}</span>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 ? (
          <div className="bg-[#1c1c1e] rounded-[28px] p-10 text-center border border-white/5 space-y-2">
            <Package className="w-10 h-10 text-white/20 mx-auto" />
            <p className="text-white/40 font-bold text-sm">No products in inventory</p>
            <p className="text-white/20 text-xs">Click the + button above to add your first item.</p>
          </div>
        ) : (
          products.map(p => {
            const hasPrice = p.price !== undefined && p.price !== null && !isNaN(Number(p.price));
            const hasPreOrder = Boolean(p.isPreOrder);

            return (
              <div key={p.id} className="bg-[#1c1c1e] rounded-[28px] p-5 flex gap-5 items-center border border-white/5 hover:border-white/10 transition-colors group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-black flex-shrink-0 relative">
                  <img src={p.imageUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-white truncate text-lg">{p.name}</h4>
                  {(hasPrice || hasPreOrder) ? (
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      {hasPrice && (
                        <span className="text-cyber-blue font-bold tracking-tight text-sm">{formatCurrency(Number(p.price))}</span>
                      )}
                      {hasPreOrder && (
                        <PreOrderBadge size="sm" />
                      )}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs italic mt-0.5">No price set</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleEdit(p)} 
                    className="w-12 h-12 glass-button text-cyber-blue/70 hover:text-cyber-blue hover:bg-cyber-blue/10 flex items-center justify-center transition-colors"
                    title="Edit Product"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(p)} 
                    className="w-12 h-12 glass-button text-red-500/70 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Permanent Deletion Confirmation Modal */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteCandidate(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md bg-[#1c1c1e] border border-red-500/20 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Permanently Delete Product?</h3>
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Database Record Destruction</p>
                </div>
              </div>

              {/* Product preview */}
              <div className="flex items-center gap-4 bg-black/50 p-4 rounded-2xl border border-white/5">
                <img 
                  src={deleteCandidate.imageUrl} 
                  alt={deleteCandidate.name} 
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" 
                />
                <div className="min-w-0 flex-grow">
                  <p className="text-sm font-bold text-white truncate">{deleteCandidate.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {deleteCandidate.price !== undefined && deleteCandidate.price !== null && !isNaN(Number(deleteCandidate.price)) ? (
                      <span className="text-xs text-cyber-blue font-bold">{formatCurrency(Number(deleteCandidate.price))}</span>
                    ) : (
                      <span className="text-xs text-white/40 italic">No price</span>
                    )}
                    {deleteCandidate.isPreOrder && <PreOrderBadge size="sm" />}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-white/60">
                <p>
                  This will <span className="text-red-400 font-bold">permanently erase</span> this product from the Firestore database.
                </p>
                <p>
                  The item will immediately disappear and will <span className="text-white font-bold">not return</span> after refreshing or reopening the website.
                </p>
              </div>

              {deleteError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteCandidate(null)}
                  className="h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/30 active:scale-95"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Forever</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  const [errorText, setErrorText] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(settings);
    return onSnapshot(query(collection(db, 'banners'), orderBy('order', 'asc')), (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as BannerImage)));
    });
  }, [settings]);

  const saveInfo = async () => {
    setIsSaving(true);
    setErrorText(null);
    try { 
      await setDoc(doc(db, 'settings', 'config'), { ...form }, { merge: true }); 
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    catch (err: any) { 
      setErrorText(err.message || 'Sync failed');
      handleFirestoreError(err, OperationType.UPDATE, 'settings'); 
    }
    finally { setIsSaving(false); }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          let maxDim = 1400;
          let quality = 0.82;
          let finalUrl = '';

          for (let attempt = 0; attempt < 5; attempt++) {
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              finalUrl = reader.result as string;
              break;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            finalUrl = canvas.toDataURL('image/jpeg', quality);

            if (finalUrl.length <= 500000) {
              break;
            }

            maxDim = Math.round(maxDim * 0.8);
            quality = Math.max(0.55, quality - 0.1);
          }

          try {
            await addDoc(collection(db, 'banners'), { 
              url: finalUrl, 
              order: banners.length, 
              createdAt: serverTimestamp() 
            });
          } catch (err: any) { 
            alert('Banner upload failed: ' + (err.message || 'Permission denied or quota exceeded'));
            console.error('Banner upload error:', err);
          }
        };
        img.src = reader.result as string;
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
      <div className="bg-[#1c1c1e] rounded-[32px] p-6 sm:p-8 space-y-6 border border-white/5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-purple-500/20 to-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">System Info</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Storefront Configurations</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Phone Line</label>
            <input placeholder="+1 234 567 890" className="admin-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Email Relay</label>
            <input placeholder="support@flairfiora.com" className="admin-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
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
            "w-full h-14 text-white font-bold rounded-[20px] active:scale-[0.98] transition-all shadow-xl",
            showSuccess ? "bg-emerald-500 shadow-emerald-500/30" : "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/30 hover:brightness-110",
            errorText && "bg-rose-600 shadow-rose-600/30",
            isSaving && "opacity-50 cursor-wait"
          )}
        >
          {isSaving ? 'Synchronizing Nodes...' : errorText ? errorText : showSuccess ? 'Config Committed' : 'Commit Changes'}
        </button>
      </div>

      <div className="bg-[#1c1c1e] rounded-[32px] p-6 sm:p-8 space-y-6 border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-cyan-500/20 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
             <ImageIcon className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white tracking-wide">Visual Banners</h3>
             <p className="text-[10px] text-white/40 uppercase tracking-widest">Storefront Carousel & Text Badges</p>
           </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => bannerFileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-cyan-400/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-[16px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">Upload New Banner Frame</p>
            <p className="text-[10px] text-white/30">PNG, JPG or WEBP (Max 800KB)</p>
          </button>
          <input type="file" ref={bannerFileInputRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />

          {banners.length === 0 ? (
            <p className="text-center text-xs text-white/30 py-4">No banners active. Upload one above.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {banners.map(b => (
                <BannerItemRow 
                  key={b.id} 
                  banner={b} 
                  onSaveText={(text) => saveBannerText(b.id, text)}
                  onDelete={() => deleteBanner(b.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BannerItemRow({ 
  banner, 
  onSaveText, 
  onDelete 
}: { 
  key?: string;
  banner: BannerImage; 
  onSaveText: (text: string) => Promise<void>; 
  onDelete: () => void | Promise<void>;
}) {
  const [textVal, setTextVal] = useState(banner.text || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTextVal(banner.text || '');
  }, [banner.text]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveText(textVal);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[24px] overflow-hidden bg-black/60 border border-white/10 p-4 space-y-3">
      <div className="flex gap-4 items-start">
        {/* Thumbnail with text overlay preview */}
        <div className="relative w-28 h-20 rounded-[14px] overflow-hidden border border-white/10 flex-shrink-0 bg-slate-900 group">
          <img 
            src={banner.url} 
            alt="Banner thumbnail" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          {textVal.trim().length > 0 && (
            <div className="absolute bottom-1 left-1 right-1 pointer-events-none">
              <span className="block text-[8px] font-black text-white bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-[6px] truncate border border-white/10">
                {textVal}
              </span>
            </div>
          )}
        </div>

        {/* Text Input & Controls */}
        <div className="flex-grow space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              Frame {banner.order + 1}
            </span>
            <button 
              onClick={onDelete}
              className="text-rose-400/70 hover:text-rose-400 transition-colors font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-lg hover:bg-rose-500/10"
            >
              Delete
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Banner headline text..." 
              className="admin-input h-10 py-0 text-xs flex-grow focus:border-cyan-400" 
              value={textVal} 
              onChange={(e) => {
                setTextVal(e.target.value);
                setIsSaved(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "h-10 px-3.5 rounded-[14px] text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0",
                isSaved 
                  ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95"
              )}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : isSaving ? (
                <span>...</span>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
