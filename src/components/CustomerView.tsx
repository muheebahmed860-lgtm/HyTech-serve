import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Trash2, ArrowRight, CheckCircle2, 
  MapPin, Clock, CreditCard, ChevronRight, Sparkles, 
  Plus, Minus, Smile, ChevronLeft, Award, HelpCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem, Order, Tenant } from '../types';
import { dbService } from '../lib/supabase';

interface CustomerViewProps {
  tableNumber: string;
  tenant: Tenant;
  onPlaceOrder: (customerName: string, items: CartItem[]) => void;
  activeOrders: Order[];
  onResetOrderFlowRef?: { current?: () => void };
}

export default function CustomerView({ 
  tableNumber, 
  tenant,
  onPlaceOrder, 
  activeOrders,
  onResetOrderFlowRef
}: CustomerViewProps) {
  // Navigation inside the mobile customer screen
  // 'catalog' | 'checkout' | 'processing' | 'confirmed'
  const [screen, setScreen] = useState<'catalog' | 'checkout' | 'processing' | 'confirmed'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Ahmed');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  
  // Dynamic load menu state for active tenant
  const [tenantMenuItems, setTenantMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirmed order reference for tracking
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Fetch cuisine items for the active tenant
  useEffect(() => {
    let active = true;
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const list = await dbService.getMenuItems(tenant.id);
        if (active) {
          setTenantMenuItems(list);
          setSelectedCategory('All');
        }
      } catch (err) {
        console.error("Failed to load customer catalog", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMenu();
    return () => { active = false; };
  }, [tenant.id]);

  // Expose reset state to parent if needed for demo flows
  useEffect(() => {
    if (onResetOrderFlowRef) {
      onResetOrderFlowRef.current = () => {
        setScreen('catalog');
        setCart([]);
        setLastPlacedOrder(null);
      };
    }
  }, [onResetOrderFlowRef]);

  // If there's an active order for this table and we are in confirmed screen, track its live status updates!
  const trackedLiveOrder = useMemo(() => {
    if (!lastPlacedOrder) return null;
    return activeOrders.find(o => o.id === lastPlacedOrder.id) || lastPlacedOrder;
  }, [activeOrders, lastPlacedOrder]);

  // Dynamically compute active menu categories for that restaurant!
  const categories = useMemo(() => {
    const list = ['All'];
    tenantMenuItems.forEach(item => {
      if (!list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [tenantMenuItems]);

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'All') return tenantMenuItems;
    return tenantMenuItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory, tenantMenuItems]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === itemId);
      if (!existing) return prev;
      const newQty = existing.quantity + change;
      if (newQty <= 0) {
        return prev.filter(i => i.menuItem.id !== itemId);
      }
      return prev.map(i => i.menuItem.id === itemId ? { ...i, quantity: newQty } : i);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.menuItem.price * curr.quantity), 0);
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setScreen('checkout');
  };

  const handlePayAndPlaceOrder = () => {
    if (!customerName.trim()) return;
    setScreen('processing');
    
    // Simulate transaction delay
    setTimeout(async () => {
      const seed = Math.floor(Math.random() * 9000) + 1000;
      const orderNum = `HT${seed}`;
      
      const newOrder: Order = {
        id: `ord-cust-${Math.random().toString(36).substr(2, 9)}`,
        tenantId: tenant.id,
        orderNumber: orderNum,
        tableNumber: tableNumber,
        customerName: customerName,
        items: [...cart],
        total: cartTotal,
        status: 'New Order',
        timestamp: new Date().toISOString(),
        voiceAnnounced: false,
        pushedToMobile: false
      };

      // Place in database real-time
      await dbService.placeOrder(newOrder);

      onPlaceOrder(customerName, [...cart]);
      
      // Keep track of this specific order locally in this customer view session
      setLastPlacedOrder(newOrder);
      setCart([]); // Clear cart
      setScreen('confirmed');
    }, 1800);
  };

  // Helper to determine status progress step
  const getStatusStepIndex = (status: string) => {
    switch(status) {
      case 'New Order': return 1;
      case 'Preparing': return 2;
      case 'Ready': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  // BRAND THEME MAPPING CODES (Saves writing inline style attributes and is highly optimized)
  const theme = useMemo(() => {
    const styleId = tenant.branding.themeStyle;
    switch(styleId) {
      case 'emerald-minimal':
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/35',
          hoverBorderColor: 'hover:border-emerald-500/60',
          bgColor: 'bg-emerald-500/10',
          badgeBg: 'bg-emerald-500/15',
          goldText: 'gold-text-emerald',
          gradientBtn: 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black',
          dotPulse: 'bg-emerald-500',
          accentBorder: 'border-emerald-500/20'
        };
      case 'cyberpunk-neon':
        return {
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/35',
          hoverBorderColor: 'hover:border-purple-500/60',
          bgColor: 'bg-rose-500/10',
          badgeBg: 'bg-rose-500/15',
          goldText: 'gold-text-cyber',
          gradientBtn: 'bg-gradient-to-r from-rose-500 to-purple-600 text-white',
          dotPulse: 'bg-rose-500',
          accentBorder: 'border-rose-500/20'
        };
      case 'cherry-bistro':
        return {
          textColor: 'text-red-400',
          borderColor: 'border-red-500/35',
          hoverBorderColor: 'hover:border-red-500/60',
          bgColor: 'bg-red-500/10',
          badgeBg: 'bg-red-500/15',
          goldText: 'gold-text-cherry',
          gradientBtn: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
          dotPulse: 'bg-red-500',
          accentBorder: 'border-red-500/20'
        };
      default: // gold-classic default
        return {
          textColor: 'text-[#D4AF37]',
          borderColor: 'border-[#D4AF37]/35',
          hoverBorderColor: 'hover:border-[#D4AF37]/60',
          bgColor: 'bg-[#D4AF37]/10',
          badgeBg: 'bg-[#D4AF37]/15',
          goldText: 'gold-text',
          gradientBtn: 'gold-gradient text-black',
          dotPulse: 'bg-[#D4AF37]',
          accentBorder: 'border-[#D4AF37]/20'
        };
    }
  }, [tenant.branding.themeStyle]);

  return (
    <div className="w-full max-w-sm mx-auto h-[780px] bg-black rounded-[48px] border-[8px] border-[#151515] relative overflow-hidden flex flex-col mobile-shadow shrink-0 text-neutral-200 select-none">
      
      {/* Decorative Camera Notch / Speaker */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#151515] rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-1.5 bg-neutral-800 rounded-full" />
      </div>

      {/* Screen Header - Adapts dynamically to tenant styling */}
      <header className="pt-8 pb-4 px-5 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between z-10 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {tenant.logoUrl && (
            <img src={tenant.logoUrl} alt={tenant.name} className="w-7 h-7 rounded-lg object-cover border border-white/15 shrink-0" />
          )}
          <div className="min-w-0">
            <h5 className="font-display font-black text-xs text-white uppercase tracking-wider truncate leading-none">{tenant.name}</h5>
            <span className="text-[8.5px] font-mono text-zinc-400 truncate block mt-0.5 uppercase tracking-tight">{tenant.branding.tagline}</span>
          </div>
        </div>
        
        {/* Table Station Badge Bubble */}
        <div className={`px-3 py-1 rounded-full border shadow-sm shrink-0 ${theme.bgColor} ${theme.borderColor}`}>
          <span className={`text-xs font-black font-mono leading-none ${theme.textColor}`}>Table {tableNumber}</span>
        </div>
      </header>

      {/* Screen Body Content */}
      <div className="flex-1 overflow-y-auto pb-24 relative select-none">
        
        <AnimatePresence mode="wait">
          
          {/* CATALOG SCREEN */}
          {screen === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-5"
            >
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 border-white/5 border-t-zinc-400 animate-spin`} />
                  <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Loading Chef Kitchen Menu...</p>
                </div>
              ) : tenantMenuItems.length === 0 ? (
                <div className="py-24 text-center p-6 space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-white/5 text-zinc-600 border border-white/10 mb-1">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Recipes Active</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">This restaurant hasn't seeded their Menu yet. Setup items inside the SaaS Owner Dashboard to display here!</p>
                </div>
              ) : (
                <>
                  {/* Premium Welcome Card */}
                  <div className="glass-card p-4 rounded-[24px] flex items-center justify-between overflow-hidden relative border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-1 z-10">
                      <span className={`text-[9px] font-mono tracking-widest uppercase flex items-center gap-1 font-bold ${theme.textColor}`}>
                        <Award className="w-3.5 h-3.5" /> High-Society Culinary
                      </span>
                      <h3 className="text-base font-display font-extrabold text-white leading-tight capitalize">{tenant.name}</h3>
                      <p className="text-[10.5px] text-neutral-400 font-semibold italic">Fresh self-checkout ordering</p>
                    </div>
                    <div className="text-center bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 z-10 shrink-0">
                      <span className="text-[9px] text-neutral-400 uppercase block font-mono">SEAT</span>
                      <span className={`text-sm font-mono font-black leading-none ${theme.textColor}`}>{tableNumber}</span>
                    </div>
                  </div>

                  {/* Categories Dynamic scroll selectors */}
                  <div className="space-y-1.5">
                    <h4 className={`text-[10px] uppercase tracking-widest font-mono font-bold pl-1 ${theme.textColor}`}>Exquisite Menu</h4>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                      {categories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                              isActive 
                                ? `${theme.gradientBtn} shadow font-black scale-102` 
                                : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product Cards List */}
                  <div className="space-y-3.5">
                    {filteredMenuItems.map((item) => {
                      const quantityInCart = cart.find(i => i.menuItem.id === item.id)?.quantity || 0;
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`glass-card rounded-[24px] overflow-hidden flex p-3 gap-3 relative transition-all border border-white/5 ${theme.hoverBorderColor}`}
                        >
                          {/* Veg logo indicator top left */}
                          <div className="absolute top-4 left-4 z-10 p-1 bg-black/85 rounded-full border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500 shadow-sm' : 'bg-rose-500 shadow-sm'}`} />
                          </div>

                          {/* Food Image with custom properties */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/5 relative self-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {item.badge && (
                              <span className="absolute bottom-1 right-1 bg-black/80 border border-white/10 text-white text-[7px] font-mono font-bold px-1 rounded-sm shadow uppercase">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                            <div className="space-y-0.5">
                              <h4 className="font-display font-semibold text-white text-xs truncate">{item.name}</h4>
                              <p className="text-[10px] text-neutral-400 line-clamp-2 leading-tight">{item.description}</p>
                            </div>

                            <div className="flex items-center justify-between mt-1.5 leading-none">
                              <span className={`font-mono text-xs font-black ${theme.textColor}`}>₹{item.price}</span>
                              
                              {/* Add to Cart Actions */}
                              {quantityInCart > 0 ? (
                                <div className="flex items-center bg-white/5 rounded-full border border-white/10 p-0.5">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-xs text-white/80 hover:bg-white/5 cursor-pointer"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="px-2 text-[10.5px] font-mono font-bold text-white leading-none">{quantityInCart}</span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-90 cursor-pointer ${theme.gradientBtn}`}
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className={`px-3 py-1 rounded-full bg-white/5 text-xs font-bold transition-all border ${theme.borderColor} ${theme.textColor} hover:bg-white/10 cursor-pointer`}
                                >
                                  Add +
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* CHECKOUT FORM SCREEN */}
          {screen === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.2 }}
              className="p-5 space-y-5"
            >
              {/* Back Header */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setScreen('catalog')}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">Configure Checkout</h3>
              </div>

              {/* Enter Customer Details Form */}
              <div className="space-y-4 glass-card p-4 rounded-3xl border border-white/5">
                <div className="space-y-1.5 text-left">
                  <label className={`text-[9px] uppercase font-mono tracking-wider font-bold pl-1 ${theme.textColor}`}>Customer Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none transition-all font-medium`}
                      placeholder="e.g. Sanjay Sen"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Smile className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-0.5 bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] uppercase font-mono text-zinc-500">Restaurant</span>
                    <span className="text-[10px] font-bold text-white block truncate leading-tight capitalize">{tenant.name}</span>
                  </div>
                  <div className="space-y-0.5 bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] uppercase font-mono text-zinc-500">Dine-In Space</span>
                    <span className={`text-[10px] font-black block font-mono leading-tight ${theme.textColor}`}>Table {tableNumber}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <h4 className={`text-[9.5px] uppercase font-mono tracking-wider font-bold pl-1 text-left ${theme.textColor}`}>Payment Channel</h4>
                <div className="space-y-2">
                  {[
                    { id: 'upi', label: 'Simulated Mobile UPI Pay', desc: 'Secure UPI payment sandbox', icon: Sparkles },
                    { id: 'card', label: 'Chip & Pin Debit Card', desc: 'Chip terminal swipe emulation', icon: CreditCard },
                    { id: 'counter', label: 'Cash payment on server', desc: 'Settle bill at final table delivery', icon: MapPin }
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? `bg-white/5 ${theme.borderColor} ${theme.textColor}` 
                            : 'bg-[#111111]/45 border-white/5 text-neutral-400 hover:border-white/10'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg border shrink-0 ${isSelected ? theme.borderColor : 'border-white/5'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 pr-1 text-left">
                          <p className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-neutral-300'}`}>{method.label}</p>
                          <p className="text-[9.5px] text-zinc-400 leading-none mt-1 truncate">{method.desc}</p>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mt-1.5 shrink-0 ${isSelected ? theme.borderColor : 'border-zinc-700'}`}>
                          {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${theme.dotPulse}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="glass-card rounded-[24px] p-4 space-y-2 border border-white/5 text-left">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Subtotal quantity</span>
                  <span className="font-mono">({cart.reduce((s, i) => s + i.quantity, 0)} meals)</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Multitenant SaaS Tax</span>
                  <span className="font-mono text-emerald-500">₹0.00 (Free)</span>
                </div>
                <hr className="border-white/5" />
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">Total Bill Outstanding</span>
                  <span className={`font-mono text-sm font-extrabold ${theme.textColor}`}>₹{cartTotal}</span>
                </div>
              </div>
              
              <button
                onClick={handlePayAndPlaceOrder}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all ${theme.gradientBtn}`}
              >
                <span>Settle Order Bill</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </motion.div>
          )}

          {/* PROCESSING LINGERING SPINNER */}
          {screen === 'processing' && (
            <motion.div
              key="processing"
              initial={{ bgOpacity: 0 }}
              animate={{ bgOpacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-50 pointer-events-none"
            >
              <div className="relative mb-6">
                <div className={`w-12 h-12 rounded-full border-4 border-white/5 border-t-[#D4AF37] animate-spin`} style={{ borderTopColor: tenant.branding.primaryColor }} />
                <ShoppingBag className="w-5 h-5 absolute top-3.5 left-3.5 animate-pulse" style={{ color: tenant.branding.primaryColor }} />
              </div>

              <span className="text-[9px] uppercase font-mono tracking-widest font-bold mb-1.5" style={{ color: tenant.branding.primaryColor }}>Verifying Ledger...</span>
              <h3 className="font-display font-extrabold text-white text-base mb-1">Authenticating Payload</h3>
              <p className="text-[11px] text-zinc-400 max-w-xs leading-normal">
                Configuring multi-tenant SaaS transactional router. Broadcasting live packet schema to local & PostgreSQL hosts...
              </p>
            </motion.div>
          )}

          {/* ORDER CONFIRMED TRACKER SCREEN */}
          {screen === 'confirmed' && trackedLiveOrder && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="p-5 space-y-5"
            >
              <div className="text-center space-y-1.5 py-2">
                <div className={`inline-flex p-3 rounded-full bg-white/5 border mb-1 ${theme.borderColor} ${theme.textColor}`}>
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">Order Received!</h3>
                <div className="inline-flex px-3 py-1 bg-white/5 border border-white/5 text-[10px] rounded-full font-mono font-bold" style={{ color: tenant.branding.primaryColor }}>
                  Order SKU: #{trackedLiveOrder.orderNumber}
                </div>
              </div>

              {/* Preparation Tracker Timeline */}
              <div className="glass-card rounded-[24px] p-4 space-y-4 border border-white/5 text-left">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] uppercase font-mono font-bold ${theme.textColor}`}>Cook Pipeline</span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold font-mono" style={{ color: tenant.branding.primaryColor }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>~15 min prep</span>
                  </div>
                </div>

                {/* Status bar graphic */}
                <div className="relative pt-1 pl-1">
                  <div className="absolute top-4 left-4 h-[120px] w-0.5 bg-white/5" />
                  
                  {[
                    { stepIdx: 1, label: 'Order Registered', desc: 'Arrived at Chef Terminal', labelStatus: 'New Order' },
                    { stepIdx: 2, label: 'Gourmet Prep Initiated', desc: 'Sizzling on the local grill', labelStatus: 'Preparing' },
                    { stepIdx: 3, label: 'Ready for Runner', desc: 'Plated, awaiting delivery', labelStatus: 'Ready' },
                    { stepIdx: 4, label: 'Served', desc: 'Bon appetit!', labelStatus: 'Delivered' }
                  ].map((step) => {
                    const currentIdx = getStatusStepIndex(trackedLiveOrder.status);
                    const isDone = currentIdx >= step.stepIdx;
                    const isActive = currentIdx === step.stepIdx;

                    return (
                      <div key={step.stepIdx} className="flex gap-3 mb-3 items-start last:mb-0">
                        <div className={`relative z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isActive 
                            ? 'gold-gradient text-black font-extrabold shadow-md' 
                            : isDone 
                              ? `bg-black ${theme.borderColor} ${theme.textColor}`
                              : 'bg-black border-white/5 text-neutral-600'
                        }`}>
                          {isDone && !isActive ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <span className="text-[9px] font-mono">{step.stepIdx}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className={`text-[11px] font-bold leading-none ${
                            isActive ? theme.textColor : isDone ? 'text-white' : 'text-neutral-500'
                          }`}>
                            {step.label}
                          </h5>
                          <p className="text-[9px] text-zinc-500 leading-tight mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order summary card */}
              <div className="glass-card rounded-[24px] p-4 text-[11px] space-y-2 border border-white/5 text-left">
                <span className={`text-[9px] font-mono uppercase tracking-wider block font-black ${theme.textColor}`}>Summary Matrix</span>
                {trackedLiveOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-zinc-300">
                    <span>{it.quantity}x {it.menuItem.name}</span>
                    <span className="font-mono text-zinc-500">₹{it.menuItem.price * it.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-white/5 pt-1.5 flex justify-between font-bold text-white leading-none">
                  <span>Grand Total</span>
                  <span className={`font-mono font-black ${theme.textColor}`}>₹{trackedLiveOrder.total}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setScreen('catalog');
                    setCart([]);
                  }}
                  className="px-5 py-2.5 w-full rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Order Additional Food
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* CATALOG STICKY FOOTER CART ACTIONS */}
      {screen === 'catalog' && cart.length > 0 && (
        <motion.div 
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-0 right-0 px-6 z-40 pointer-events-none"
        >
          <div className="bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-[28px] p-4 shadow-2xl mobile-shadow pointer-events-auto">
            <div className="flex justify-between items-center mb-3 text-left">
              <span className="text-zinc-500 text-xs font-semibold">Subtotal ({cart.reduce((s, curr) => s + curr.quantity, 0)} items)</span>
              <span className={`font-black text-lg font-mono ${theme.textColor}`}>₹{cartTotal}</span>
            </div>
            <button
              onClick={handleCheckout}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 transition-all ${theme.gradientBtn}`}
            >
              <span>Draft Checkout</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
