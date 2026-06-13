import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Monitor, Smartphone, Eye, Sparkles, BookOpen, 
  HelpCircle, Volume2, Coffee, Trash2, Award, Zap,
  Database, Users, Building2, ChevronDown, Compass, Settings, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus, CartItem, Tenant } from './types';
import CustomerView from './components/CustomerView';
import KitchenView from './components/KitchenView';
import PresenterControl from './components/PresenterControl';
import DashboardView from './components/DashboardView';
import { dbService, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  // 'split' (Interactive Presentation Studio) | 'dashboard' (Full Portal) | 'customer' (Isolated Mobile App) | 'kitchen' (Kitchen terminal View)
  const [view, setView] = useState<'split' | 'dashboard' | 'customer' | 'kitchen'>('split');
  const [tableNumber, setTableNumber] = useState<string>('5');
  const [showLiveVisualAlert, setShowLiveVisualAlert] = useState<string | null>(null);

  // Multi-tenant SaaS states
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [isTenantSelectorOpen, setIsTenantSelectorOpen] = useState(false);
  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState<'customer' | 'kitchen'>('customer');
  const [orders, setOrders] = useState<Order[]>([]);

  // Reference for resetting ordering flow
  const customerViewResetRef = useRef<() => void>(undefined);

  // Read URL query parameters to support scanning QR on real phones to load customer/kitchen directly!
  useEffect(() => {
    const initSaaS = async () => {
      const list = await dbService.getTenants();
      setTenants(list);

      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const tableParam = params.get('table');
      const tenantParam = params.get('tenant') || params.get('slug');

      // Attempt matching tenant based on URL parameters
      let selectedDefault = list[0];
      if (tenantParam) {
        const found = list.find(t => t.slug === tenantParam || t.id === tenantParam);
        if (found) {
          selectedDefault = found;
        }
      }
      setActiveTenant(selectedDefault);

      if (viewParam === 'customer') {
        setView('customer');
      } else if (viewParam === 'kitchen') {
        setView('kitchen');
      } else if (viewParam === 'dashboard') {
        setView('dashboard');
      }
      
      if (tableParam) {
        setTableNumber(tableParam);
      }
    };
    initSaaS();
  }, []);

  // Fetch active orders dynamically when active tenant changes
  const refreshTenantOrders = async () => {
    if (!activeTenant) return;
    const list = await dbService.getOrders(activeTenant.id);
    setOrders(list);
  };

  useEffect(() => {
    refreshTenantOrders();
  }, [activeTenant?.id]);

  // Sync listener to refresh state in real-time when orders are placed
  useEffect(() => {
    const handleOrderEvent = () => {
      refreshTenantOrders();
    };
    window.addEventListener('saas_order_update', handleOrderEvent);
    return () => window.removeEventListener('saas_order_update', handleOrderEvent);
  }, [activeTenant?.id]);

  // Listen to branding updates made in owner dashboard
  useEffect(() => {
    const handleBrandingEvent = (e: Event) => {
      const custEvent = e as CustomEvent<Tenant>;
      if (custEvent.detail && custEvent.detail.id === activeTenant?.id) {
        setActiveTenant(custEvent.detail);
      }
    };
    window.addEventListener('saas_branding_update', handleBrandingEvent);
    return () => window.removeEventListener('saas_branding_update', handleBrandingEvent);
  }, [activeTenant?.id]);

  // Submit Guest ordering payload
  const handlePlaceOrder = (customerName: string, items: CartItem[]) => {
    refreshTenantOrders();
    
    // Voice prompt alerts trigger
    const itemsCombined = items.map(it => `${it.quantity}x ${it.menuItem.name}`).join(' and ');
    const textAlert = `New order from Table ${tableNumber} placed: ${itemsCombined}.`;
    
    setShowLiveVisualAlert(textAlert);
    setTimeout(() => {
      setShowLiveVisualAlert(null);
    }, 5500);
  };

  // Text-To-Speech order alert parser
  const handleAnnounceOrder = (order: Order) => {
    if (!('speechSynthesis' in window)) return;

    const itemsCombined = order.items.map(it => `${it.quantity === 1 ? 'One' : it.quantity} ${it.menuItem.name}`).join(', ');
    const textPayload = `New order received from Table ${order.tableNumber}. ${itemsCombined}. Ready for chef preparation.`;

    setShowLiveVisualAlert(textPayload);
    setTimeout(() => {
      setShowLiveVisualAlert(null);
    }, 5500);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textPayload);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en-'));
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
    dbService.setOrderVoiced(order.id);
  };

  // Random customer order generator block
  const handleGenerateDemoOrder = async () => {
    if (!activeTenant) return;

    const customerNames = ['Aarav', 'Nisha', 'Rohan', 'Sneha', 'Kabir', 'Ananya', 'Priya', 'Elena', 'Hiro'];
    // Fetch tables and recipes configured for this restaurant
    const configTables = await dbService.getTables(activeTenant.id);
    const configMenu = await dbService.getMenuItems(activeTenant.id);

    if (configMenu.length === 0) {
      alert("⚠️ Menu Builder items are empty! Please seed a recipe inside Menu Builder to generate simulated orders.");
      return;
    }

    const chosenName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const chosenTable = configTables.length > 0 
      ? configTables[Math.floor(Math.random() * configTables.length)].tableNumber 
      : '5';

    // Pick 1-2 random items from active menu
    const shuffledMenu = [...configMenu].sort(() => 0.5 - Math.random());
    const itemsCount = Math.min(Math.floor(Math.random() * 2) + 1, shuffledMenu.length);
    const chosenCart: CartItem[] = shuffledMenu.slice(0, itemsCount).map(food => ({
      menuItem: food,
      quantity: Math.floor(Math.random() * 2) + 1
    }));

    const orderTotal = chosenCart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const orderNum = `HT${Math.floor(Math.random() * 9000) + 1000}`;

    const syntheticOrder: Order = {
      id: `ord-demo-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: activeTenant.id,
      orderNumber: orderNum,
      tableNumber: chosenTable,
      customerName: chosenName,
      items: chosenCart,
      total: orderTotal,
      status: 'New Order',
      timestamp: new Date().toISOString(),
      voiceAnnounced: false,
      pushedToMobile: false
    };

    await dbService.placeOrder(syntheticOrder);
    refreshTenantOrders();
  };

  // Track page application preview URL dynamically
  const appUrl = useMemo(() => {
    return window.location.origin;
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-neutral-200 antialiased font-sans relative flex flex-col selection:bg-[#D4AF37]/30 selection:text-white">
      
      {/* Background glowing aesthetic meshes */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-zinc-900/10 via-[#D4AF37]/2 to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#D4AF37]/2 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Screen Overlay Voice Notification Alert (Perfect for Muted Iframe environments) */}
      <AnimatePresence>
        {showLiveVisualAlert && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[150] w-full max-w-xl px-4"
          >
            <div className="bg-black/95 border border-[#D4AF37]/80 p-4 rounded-3xl flex items-center gap-3.5 shadow-2xl backdrop-blur-md">
              <div className="p-2.5 bg-gradient-to-tr from-[#D4AF37] to-amber-600 rounded-full text-black relative shrink-0">
                <Volume2 className="w-5 h-5 animate-pulse text-black" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                </span>
              </div>
              <div className="flex-grow min-w-0 text-left">
                <span className="text-[9.5px] uppercase tracking-widest font-mono text-[#D4AF37] font-black block">Simulated Voice Alert</span>
                <p className="text-white text-[11px] font-mono leading-relaxed mt-1 border-l-2 border-white/20 pl-2.5 italic">
                  "{showLiveVisualAlert}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary SaaS Header */}
      <header className="border-b border-white/5 bg-black/85 backdrop-blur-md sticky top-0 z-[80] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow">
        
        {/* Brand logo & platform label */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-[#D4AF37] font-black flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 fill-current text-[#D4AF37]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-wider text-white uppercase text-base leading-none">SmartServe SaaS</span>
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] font-black font-mono rounded text-zinc-400">MULTI-TENANT</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono font-medium tracking-wide mt-1">Hospitality CRM Cloud Engine • 2026 Version</p>
          </div>
        </div>

        {/* Dynamic Multi-tenant switches */}
        {activeTenant && (
          <div className="relative">
            <button
              onClick={() => setIsTenantSelectorOpen(!isTenantSelectorOpen)}
              className="flex items-center gap-2.5 px-4.5 py-2.5 bg-[#121212] border border-white/15 rounded-2xl text-xs font-bold font-mono text-white tracking-wide hover:border-white/25 cursor-pointer transition select-none"
            >
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span>ACTIVE RESTAURANT:</span>
              <span className="text-[#D4AF37] font-black uppercase tracking-tight">{activeTenant.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isTenantSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Selector list dropdown absolute */}
            <AnimatePresence>
              {isTenantSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-64 bg-black border border-white/10 rounded-2xl shadow-xl overflow-hidden z-[100] p-1.5"
                >
                  <span className="text-[8px] font-mono text-zinc-500 px-3.5 py-1 text-left block font-bold uppercase tracking-widest border-b border-white/5 mb-1.5">Configure Active Tenant</span>
                  
                  {tenants.map(t => {
                    const isActive = t.id === activeTenant.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTenant(t);
                          setIsTenantSelectorOpen(false);
                          if (customerViewResetRef.current) {
                            customerViewResetRef.current();
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer select-none ${
                          isActive ? 'bg-[#D4AF37]/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={t.logoUrl} alt={t.name} className="w-5 h-5 rounded-md object-cover border shrink-0" />
                          <span className="truncate pr-1">{t.name}</span>
                        </div>
                        <span className="text-[8.5px] font-mono font-black py-0.5 px-2 bg-white/5 rounded border border-white/10 text-zinc-500 shrink-0 uppercase tracking-tight">
                          {t.branding.themeStyle.split('-')[0]}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Global Select Workspace Mode selector tabs */}
        <div className="flex rounded-full bg-white/5 border border-white/10 p-1 font-mono text-xs scale-98 sm:scale-100 shrink-0">
          {[
            { id: 'split', label: 'Playground Suite', icon: Monitor },
            { id: 'dashboard', label: 'Admin SaaS', icon: Settings },
            { id: 'customer', label: 'Guest QR Web', icon: Smartphone },
            { id: 'kitchen', label: 'Kitchen PWA', icon: Eye }
          ].map((item) => {
            const isSelected = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`px-3.5 py-2 rounded-full cursor-pointer flex items-center gap-1.5 transition-all font-bold ${
                  isSelected 
                    ? 'gold-gradient text-black shadow font-black scale-102' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Primary switchboards */}
      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col justify-start z-10">
        <AnimatePresence mode="wait">
          {activeTenant ? (
            <>
              {/* VIEW: SPLIT WORKSPACE STUDIOS PLAYGROUND */}
              {view === 'split' && (
                <motion.div
                  key="split-suite"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full"
                >
                  
                  {/* Left component: Presenter controllers and notes - 3 Cols */}
                  <div className="xl:col-span-3 space-y-5">
                    <PresenterControl
                      tenant={activeTenant}
                      onGenerateDemoOrder={handleGenerateDemoOrder}
                      appUrl={appUrl}
                      tableNumber={tableNumber}
                      onSetTableNumber={setTableNumber}
                      currentView={view}
                      onSetView={setView}
                    />
                  </div>

                  {/* Central component: Detailed owner dashboards - 5 Cols */}
                  <div className="xl:col-span-5 space-y-6">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] mb-2 flex items-center gap-1 font-bold">
                      <Settings className="w-3.5 h-3.5 text-[#D4AF37]" /> Restaurant Configuration Hub
                    </span>
                    <div className="glass-card rounded-[32px] p-5 border border-white/5 relative">
                      <DashboardView 
                        tenant={activeTenant} 
                        onUpdateTenant={setActiveTenant}
                        onRefreshData={refreshTenantOrders}
                      />
                    </div>
                  </div>

                  {/* Right component: Multi role interactive device preview mockup with smart selectors (Guest ordering flow OR kitchen PWA) - 4 Cols */}
                  <div className="xl:col-span-4 flex flex-col items-center">
                    
                    {/* Switcher tabs for active mockup */}
                    <div className="flex bg-[#121212]/90 border border-white/10 p-1 rounded-2xl mb-4 font-mono select-none">
                      <button
                        onClick={() => setActiveWorkspaceSubTab('customer')}
                        className={`px-3 py-1 text-[10.5px] rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                          activeWorkspaceSubTab === 'customer' ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Client App</span>
                      </button>
                      <button
                        onClick={() => setActiveWorkspaceSubTab('kitchen')}
                        className={`px-3 py-1 text-[10.5px] rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                          activeWorkspaceSubTab === 'kitchen' ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Kitchen PWA</span>
                      </button>
                    </div>

                    <div className="relative">
                      {/* Ambient background blur */}
                      <div className="absolute inset-5 bg-white/5 blur-3xl rounded-[40px] pointer-events-none" />
                      
                      <AnimatePresence mode="wait">
                        {activeWorkspaceSubTab === 'customer' ? (
                          <motion.div
                            key="split-mockup-customer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <CustomerView
                              tableNumber={tableNumber}
                              tenant={activeTenant}
                              activeOrders={orders}
                              onPlaceOrder={handlePlaceOrder}
                              onResetOrderFlowRef={customerViewResetRef}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="split-mockup-kitchen"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <KitchenView
                              tenant={activeTenant}
                              onRefreshData={refreshTenantOrders}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                </motion.div>
              )}

              {/* VIEW: FULL SCREEN OWNER RESORT PLATFORM PORTAL */}
              {view === 'dashboard' && (
                <motion.div
                  key="full-dashboard"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-6xl mx-auto w-full pt-2"
                >
                  <div className="mb-4 flex justify-between items-center text-left">
                    <button 
                      onClick={() => setView('split')}
                      className="px-4.5 py-1.5 bg-white/5 border border-white/10 text-xs rounded-full text-zinc-300 font-bold hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                      ← Return to Playground Suite
                    </button>
                    <span className="text-[10px] font-mono text-zinc-500">Standalone SaaS Dash View</span>
                  </div>

                  <div className="glass-card rounded-[32px] p-6 border border-white/10 shadow-lg">
                    <DashboardView 
                      tenant={activeTenant} 
                      onUpdateTenant={setActiveTenant}
                      onRefreshData={refreshTenantOrders}
                    />
                  </div>
                </motion.div>
              )}

              {/* VIEW: FULL ISOLATED CUSTOMER DIGITAL VIEW (Ideal for scanning on real phone) */}
              {view === 'customer' && (
                <motion.div
                  key="full-customer"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="max-w-md mx-auto w-full flex flex-col items-center pt-2 sm:pt-4"
                >
                  <div className="mb-4 flex items-center justify-between w-full px-2">
                    <button 
                      onClick={() => setView('split')}
                      className="px-4 py-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs rounded-full text-[#D4AF37] font-bold hover:bg-[#D4AF37]/30 transition"
                    >
                      ← Back to Host Suite
                    </button>
                    <span className="text-xs text-zinc-500 font-mono font-bold uppercase shrink-0">Table Check {tableNumber}</span>
                  </div>

                  <CustomerView
                    tableNumber={tableNumber}
                    tenant={activeTenant}
                    activeOrders={orders}
                    onPlaceOrder={handlePlaceOrder}
                    onResetOrderFlowRef={customerViewResetRef}
                  />
                </motion.div>
              )}

              {/* VIEW: FULL ISOLATED KITCHEN MONITOR View */}
              {view === 'kitchen' && (
                <motion.div
                  key="full-kitchen"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-5xl mx-auto w-full pt-2"
                >
                  <div className="mb-4 flex justify-between items-center pr-1 text-left">
                    <button 
                      onClick={() => setView('split')}
                      className="px-4.5 py-1.5 bg-white/5 border border-white/10 text-xs rounded-full text-zinc-300 font-bold hover:bg-white/10 transition cursor-pointer"
                    >
                      ← Back to Host Suite
                    </button>
                    
                    <button
                      onClick={handleGenerateDemoOrder}
                      className="px-4 py-1.5 text-xs rounded-full text-black font-black flex items-center gap-1 shadow cursor-pointer transition"
                      style={{ backgroundColor: activeTenant.branding.primaryColor }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Inject Mock Transaction</span>
                    </button>
                  </div>

                  <KitchenView
                    tenant={activeTenant}
                    onRefreshData={refreshTenantOrders}
                  />
                </motion.div>
              )}
            </>
          ) : (
            <div className="py-44 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 border-2 border-white/5 border-t-[#D4AF37] rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">Warming Up Multi-Tenant SaaS Cloud Database...</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-4.5 text-center text-[10.5px] text-zinc-500 font-mono mt-auto shrink-0 z-10 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 gap-2">
          <span>SmartServe Pro • All Rights Reserved 2026 ©</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span>Bespoke Multi-Tenant SaaS Suite Powered by Antigravity DB Engine</span>
        </div>
      </footer>

    </div>
  );
}
