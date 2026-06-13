import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, CheckSquare, Square, Clock, 
  MapPin, User, ChevronRight, CheckCircle2, Coffee,
  AlertCircle, Sparkles, Play, RotateCcw, Smartphone, Laptop,
  Bell, BellOff, Check, AlertOctagon, Smartphone as PwaIcon,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus, Tenant } from '../types';
import { dbService } from '../lib/supabase';

interface KitchenViewProps {
  tenant: Tenant;
  onRefreshData?: () => void;
}

export default function KitchenView({ tenant, onRefreshData }: KitchenViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceLayout, setDeviceLayout] = useState<'desktop' | 'mobile-pwa'>('mobile-pwa');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Real-time Push Notification banner state (iOS mock top bar)
  const [pushedNotification, setPushedNotification] = useState<string | null>(null);

  // Load orders for this tenant
  const loadOrders = async () => {
    try {
      const list = await dbService.getOrders(tenant.id);
      setOrders(list);
    } catch (err) {
      console.error("Failed to load restaurant orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [tenant.id]);

  // Real-time order syncer
  useEffect(() => {
    const handleOrderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Order>;
      const liveOrder = customEvent.detail;
      
      if (liveOrder && liveOrder.tenantId === tenant.id) {
        loadOrders();
        
        // Push notification triggered for New Orders where pushedToMobile is false
        if (liveOrder.status === 'New Order' && !liveOrder.pushedToMobile) {
          // Trigger iOS-style push notification overlay banner in PWA
          setPushedNotification(`New Order #${liveOrder.orderNumber} placed at Table ${liveOrder.tableNumber} for ₹${liveOrder.total}`);
          
          // Synthesize text-to-speech voice output if muted
          if (soundEnabled) {
            triggerVoiceSynthesizer(`New order received! Table ${liveOrder.tableNumber} ordered meals outstanding.`);
          }
          
          // Mark order as pushed
          dbService.setOrderPushed(liveOrder.id);

          setTimeout(() => {
            setPushedNotification(null);
          }, 6000);
        }
      }
    };
    window.addEventListener('saas_order_update', handleOrderEvent);
    return () => window.removeEventListener('saas_order_update', handleOrderEvent);
  }, [tenant.id, soundEnabled]);

  // Voice speech synthesis helper
  const triggerVoiceSynthesizer = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en-'));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const handleNextStatus = async (order: Order) => {
    let nextStatus: OrderStatus = 'New Order';
    if (order.status === 'New Order') nextStatus = 'Preparing';
    else if (order.status === 'Preparing') nextStatus = 'Ready';
    else if (order.status === 'Ready') nextStatus = 'Delivered';

    await dbService.updateOrderStatus(order.id, nextStatus);
    loadOrders();
    if (onRefreshData) onRefreshData();
  };

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentActiveOrders = orders.filter(o => o.status !== 'Delivered');
  const finishedOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  const handleClearDelivered = async () => {
    await dbService.clearDeliveredOrders(tenant.id);
    loadOrders();
    if (onRefreshData) onRefreshData();
  };

  // Build appropriate color keys
  const getStatusBorder = (status: OrderStatus) => {
    switch (status) {
      case 'New Order': return 'border-amber-500 bg-amber-950/20 text-amber-400 animate-pulse';
      case 'Preparing': return 'border-blue-500 bg-blue-950/10 text-blue-400';
      case 'Ready': return 'border-emerald-500 bg-emerald-950/10 text-emerald-400';
      default: return 'border-zinc-800 bg-zinc-900/45 text-zinc-500';
    }
  };

  return (
    <div className="w-full flex flex-col h-full text-zinc-100 font-sans relative">
      
      {/* Selector toggle for terminal modes - Desktop Kitchen vs PWA Mobile Layout */}
      <div className="flex justify-between items-center bg-[#111111]/80 border border-white/5 p-4 rounded-2xl mb-5">
        <div>
          <h4 className="text-xs uppercase tracking-widest font-mono text-zinc-400 font-bold mb-0.5">Kitchen View Mode</h4>
          <p className="text-[11px] text-zinc-500">Dual-mode multi-tenant receiver</p>
        </div>

        <div className="flex gap-1 bg-black/60 p-1 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => setDeviceLayout('desktop')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              deviceLayout === 'desktop' ? 'bg-[#D4AF37] text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          
          <button
            onClick={() => setDeviceLayout('mobile-pwa')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition ${
              deviceLayout === 'mobile-pwa' ? 'bg-[#D4AF37] text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA Mobile</span>
          </button>
        </div>
      </div>

      {/* RENDER DEVICE SCREENS */}
      {deviceLayout === 'desktop' ? (
        /* DESKTOP GRAND TERMINAL PANEL */
        <div className="glass-card rounded-[32px] p-6 flex-1 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="font-display font-black text-sm uppercase tracking-wider">Dine-In Culinary Terminal</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound alert toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border cursor-pointer transition ${
                  soundEnabled ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]' : 'bg-white/5 border-white/15 text-zinc-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              {finishedOrdersCount > 0 && (
                <button
                  onClick={handleClearDelivered}
                  className="px-3 py-1.5 bg-red-950/20 text-red-400 font-semibold border border-red-500/15 rounded-xl text-xs hover:bg-red-950/40 transition cursor-pointer"
                >
                  Clear Archive ({finishedOrdersCount})
                </button>
              )}
            </div>
          </div>

          {/* Cooking cards grid */}
          <div className="flex-1 overflow-y-auto max-h-[550px]">
            {currentActiveOrders.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <div className="inline-flex p-4 rounded-full bg-white/5 text-zinc-600">
                  <Coffee className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Queue Cleared</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">No orders are currently outstanding. Open the customer view scanning link on the dashboard to trigger table checkouts!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentActiveOrders.map(order => (
                  <div key={order.id} className={`bg-zinc-900/60 p-4 rounded-2xl border flex flex-col justify-between h-[320px] ${order.status === 'New Order' ? 'border-[#D4AF37]/60' : 'border-white/5'}`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">#{order.orderNumber}</span>
                        <span className={`text-[8.5px] uppercase font-mono font-bold px-2 py-0.5 border rounded-full ${getStatusBorder(order.status)}`}>{order.status}</span>
                      </div>

                      <div className="flex justify-between items-center font-bold pb-2 border-b border-white/5 mb-2.5">
                        <span className="text-sm text-[#D4AF37] font-mono">Table {order.tableNumber}</span>
                        <span className="text-xs text-white truncate max-w-[120px]">{order.customerName}</span>
                      </div>

                      <div className="space-y-1 overflow-y-auto max-h-[140px] pr-1">
                        {order.items.map((it, idx) => {
                          const key = `${order.id}-${idx}`;
                          const isDone = !!checkedItems[key];
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleItemCheck(order.id, idx)}
                              className="w-full text-left flex items-start gap-2 bg-white/5 hover:bg-white/10 p-1.5 rounded-xl text-[11px] cursor-pointer"
                            >
                              {isDone ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-zinc-600" />}
                              <span className={`flex-grow truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{it.menuItem.name}</span>
                              <span className="font-mono text-[#D4AF37] font-black">x{it.quantity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between text-[11px] leading-none">
                        <span className="text-zinc-500">Outstanding Total</span>
                        <span className="font-mono text-zinc-400">₹{order.total}</span>
                      </div>
                      <button
                        onClick={() => handleNextStatus(order)}
                        className="w-full py-2 bg-[#D4AF37] hover:bg-yellow-600 text-black font-black text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        {order.status === 'New Order' ? 'Start Cooking' : order.status === 'Preparing' ? 'Mark Ready' : 'Deliver to Guest'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PWA MOBILE SCREEN LAYOUT WITH OVERLAY SYSTEM BANNERS */
        <div className="w-full max-w-sm mx-auto h-[780px] bg-[#121212] rounded-[48px] border-[8px] border-[#1c1c1c] relative overflow-hidden flex flex-col mobile-shadow text-neutral-200">
          
          {/* Mockup Notch and Signal bar */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1c1c1c] rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1.5 bg-neutral-800 rounded-full" />
          </div>

          <div className="pt-7 px-4 pb-2 bg-black border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5 font-bold">
              <PwaIcon className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">PWA Order Terminal</span>
            </div>
            <div className="flex gap-2 text-[9px] font-mono text-zinc-500">
              <span>9:41 AM</span>
              <span>100% 🔋</span>
            </div>
          </div>

          {/* SIMULATED DEVICE PUSH NOTIFICATION BANNER OVERLAY */}
          <AnimatePresence>
            {pushedNotification && (
              <motion.div
                initial={{ opacity: 0, y: -80, scale: 0.9 }}
                animate={{ opacity: 1, y: 12, scale: 1 }}
                exit={{ opacity: 0, y: -80, scale: 0.9 }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute top-10 left-3 right-3 z-[120] bg-black/95 border border-amber-500/50 p-3.5 rounded-2xl shadow-xl shadow-black/80 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 shrink-0">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-black uppercase font-mono text-amber-400">PWA PUSH ALERT</span>
                    <span className="text-[8px] text-zinc-500 font-mono">now</span>
                  </div>
                  <p className="text-[10.5px] font-semibold text-white leading-tight pr-1">{pushedNotification}</p>
                </div>
                <button onClick={() => setPushedNotification(null)} className="text-zinc-500 hover:text-white shrink-0 self-center">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core PWA Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-14 text-left select-none relative">
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase tracking-widest font-mono text-zinc-400 font-bold">Chef Inbox ({currentActiveOrders.length})</h4>
              
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border cursor-pointer ${soundEnabled ? 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10' : 'text-zinc-500 border-white/5'}`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>

            {currentActiveOrders.length === 0 ? (
              <div className="py-32 text-center p-6 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-white/5 text-zinc-700">
                  <BellOff className="w-7 h-7" />
                </div>
                <h5 className="text-xs font-bold text-white">Inbox Cleared</h5>
                <p className="text-[11px] text-zinc-500 leading-normal">Nothing cooking on the stove. New table checks will register here in real-time!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentActiveOrders.map(order => (
                  <div key={order.id} className={`bg-zinc-900 border p-3.5 rounded-2xl flex flex-col justify-between relative ${order.status === 'New Order' ? 'border-[#D4AF37]/60 shadow-lg shadow-[#D4AF37]/5' : 'border-white/5'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-0.5">
                        <span className="text-[8.5px] font-mono font-bold text-zinc-400 block">TABLE {order.tableNumber}</span>
                        <span className="text-xs font-bold text-white min-w-0 block truncate capitalize pr-1">{order.customerName}</span>
                      </div>
                      <span className={`text-[8px] uppercase font-mono font-bold px-2 py-0.5 border rounded-full ${getStatusBorder(order.status)}`}>{order.status}</span>
                    </div>

                    {/* Food Items list checklist in PWA */}
                    <div className="space-y-1 my-2">
                      {order.items.map((it, idx) => {
                        const key = `${order.id}-${idx}`;
                        const isDone = !!checkedItems[key];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => toggleItemCheck(order.id, idx)}
                            className="flex items-center gap-2 bg-black/30 border border-white/5 p-1.5 rounded-xl text-[10.5px] cursor-pointer"
                          >
                            {isDone ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 border border-zinc-700 rounded-sm shrink-0" />}
                            <span className={`flex-1 truncate ${isDone ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{it.menuItem.name}</span>
                            <span className="font-mono text-zinc-500 font-bold shrink-0">x{it.quantity}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2.5 mt-2 border-t border-white/5">
                      <span className="font-mono text-xs font-bold text-[#D4AF37]">₹{order.total}</span>
                      <button
                        onClick={() => handleNextStatus(order)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition ${
                          order.status === 'New Order' ? 'bg-[#D4AF37] text-black font-black' : order.status === 'Preparing' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                        }`}
                      >
                        <span>
                          {order.status === 'New Order' && 'Start Cook'}
                          {order.status === 'Preparing' && 'Mark Ready'}
                          {order.status === 'Ready' && 'Mark Served'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick status bottom bar */}
          <div className="absolute bottom-4 left-4 right-4 z-[90] bg-black/90 border border-white/5 px-4 py-2.5 rounded-2xl flex justify-between items-center text-zinc-500 text-[9.5px] font-mono">
            <span>Server: Connected</span>
            <span>Completed: {finishedOrdersCount}</span>
          </div>

        </div>
      )}

    </div>
  );
}
