import React from 'react';
import { 
  Sparkles, Play, Info, Smartphone, Eye, 
  Settings, Zap, CheckCircle2, QrCode, Monitor
} from 'lucide-react';
import QrDisplay from './QrDisplay';
import { Tenant } from '../types';

interface PresenterControlProps {
  tenant: Tenant;
  onGenerateDemoOrder: () => void;
  appUrl: string;
  tableNumber: string;
  onSetTableNumber: (table: string) => void;
  currentView: 'split' | 'dashboard' | 'customer' | 'kitchen';
  onSetView: (v: 'split' | 'dashboard' | 'customer' | 'kitchen') => void;
}

export default function PresenterControl({
  tenant,
  onGenerateDemoOrder,
  appUrl,
  tableNumber,
  onSetTableNumber,
  currentView,
  onSetView
}: PresenterControlProps) {
  
  const tables = ['1', '2', '5', '8', '12', '15'];

  return (
    <div className="glass-card p-6 space-y-6 rounded-[32px] overflow-hidden">
      
      {/* Dynamic Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10" style={{ color: tenant.branding.primaryColor }}>
          <Settings className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <h3 className="font-display font-black text-white text-xs tracking-wider uppercase">SaaS Demo Control Center</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Simulate multi-tenant client requests</p>
        </div>
      </div>

      {/* Screen Mode Selectors */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-mono tracking-wider font-bold pl-1" style={{ color: tenant.branding.primaryColor }}>
          Viewport Role Mockups
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'split', label: 'Suite Workspace', desc: 'SaaS Split Screen', icon: Monitor },
            { id: 'dashboard', label: 'Owner Portal', desc: 'Full Dashboard', icon: Settings },
            { id: 'customer', label: 'Guest Ordering', desc: 'Mobile Web App', icon: Smartphone },
            { id: 'kitchen', label: 'Kitchen PWA', desc: 'Waiter Mobile Terminal', icon: Eye }
          ].map((v) => {
            const isSel = currentView === v.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => onSetView(v.id as any)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  isSel 
                    ? 'bg-white/5 text-white' 
                    : 'bg-[#121212]/45 border-white/5 text-neutral-400 hover:border-white/10 hover:text-neutral-300'
                }`}
                style={isSel ? { borderColor: tenant.branding.primaryColor } : {}}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: isSel ? tenant.branding.primaryColor : '#52525b' }} />
                  <span className="text-[11.5px] font-bold leading-none">{v.label}</span>
                </div>
                <span className="text-[9.5px] text-zinc-500 font-medium leading-none block">{v.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Demo Order Trigger */}
      <div className="glass-card p-4 rounded-[24px] relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        <div className="space-y-2.5 z-10 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-mono tracking-widest font-black" style={{ color: tenant.branding.primaryColor }}>Instant Order Trigger</span>
            <span className="px-2 py-0.5 bg-white/5 text-[8px] font-mono text-zinc-400 rounded-full border border-white/10 font-black uppercase">SAAS-SYNC</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-snug">
            Inject a randomized gourmet transaction directly into this restaurant's queue. Triggers the device PWA **Push Notification Banner Overlay** and speech prompts live!
          </p>

          <button
            onClick={onGenerateDemoOrder}
            className="w-full py-3.5 text-black font-black rounded-xl text-xs tracking-widest uppercase hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{ bgGradient: 'none', backgroundColor: tenant.branding.primaryColor }}
          >
            <Zap className="w-4 h-4 fill-current text-black" />
            <span>Generate order (PWA Push)</span>
          </button>
        </div>
      </div>

      {/* Target Table Settings */}
      <div className="space-y-1.5 text-left">
        <span className="text-[10px] uppercase font-mono tracking-wider font-bold pl-1" style={{ color: tenant.branding.primaryColor }}>Active Table QR Selector</span>
        <div className="flex flex-wrap gap-1">
          {tables.map((tbl) => (
            <button
               key={tbl}
               onClick={() => onSetTableNumber(tbl)}
               className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                 tableNumber === tbl 
                   ? 'text-black border-transparent font-black font-mono shadow-sm' 
                   : 'bg-white/5 border-white/5 text-neutral-400 hover:border-white/10'
               }`}
               style={tableNumber === tbl ? { backgroundColor: tenant.branding.primaryColor } : {}}
            >
              Table {tbl}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-zinc-500 pl-1 font-mono">Updates corresponding QR vector destination</p>
      </div>

      {/* Interactive QR Display Code */}
      <QrDisplay tableNumber={tableNumber} appUrl={appUrl} tenantSlug={tenant.slug} primaryColor={tenant.branding.primaryColor} />

      {/* Guided demonstration workflow checklist */}
      <div className="glass-card p-4 rounded-[24px] space-y-2.5 border border-white/5 text-left">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" style={{ color: tenant.branding.primaryColor }} />
          <h4 className="text-[10px] uppercase tracking-wider text-white font-mono font-bold">Recommended Demo Path</h4>
        </div>
        
        <ol className="space-y-1.5 text-[11px] text-neutral-400 pl-1 list-decimal list-inside leading-relaxed font-medium">
          <li>
            <strong className="text-white">Customize Colors:</strong> Go to the <strong className="text-[#D4AF37] font-semibold">Branding tab</strong> in the owner dashboard. Change the theme style (e.g. to Emerald Organic). Notice how the customer Ordering Mockup instantly adapts its visual skin!
          </li>
          <li>
            <strong className="text-white">Modify Recipe:</strong> Add or edit custom recipes in the <strong className="text-[#D4AF37] font-semibold">Menu Builder</strong>, which syncs directly to the guest mobile card in real-time.
          </li>
          <li>
            <strong className="text-white">Trigger Order:</strong> Standard order submissions trigger simulated <strong className="text-[#D4AF37] font-semibold">Kitchen PWA Push Notifications</strong> overlay banners at the top of the mobile device viewport.
          </li>
          <li>
            <strong className="text-white">Status Tracking:</strong> Update status items inside the Kitchen terminal and watch the customer's mobile receipt update dynamically!
          </li>
        </ol>
      </div>

    </div>
  );
}
