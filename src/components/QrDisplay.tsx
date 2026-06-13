import React from 'react';
import { QrCode, Smartphone, ExternalLink, Sparkles } from 'lucide-react';

interface QrDisplayProps {
  tableNumber: string;
  appUrl: string;
  tenantSlug?: string;
  primaryColor?: string;
}

export default function QrDisplay({ tableNumber, appUrl, tenantSlug, primaryColor }: QrDisplayProps) {
  // Build a query parameter pointing to the specific restaurant and table combined
  const targetUrl = `${appUrl}?view=customer&table=${tableNumber}${tenantSlug ? `&tenant=${tenantSlug}` : ''}`;
  
  // Dynamic color selection matching brand colors
  const brandHex = primaryColor ? primaryColor.substring(1) : 'dca31f';
  
  // Use qrserver API to render a real scanable QR code pointing to our live container URL
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=${brandHex}&bgcolor=050505&data=${encodeURIComponent(
    targetUrl
  )}`;

  return (
    <div className="glass-card p-6 rounded-[28px] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Background radial gold sheen / status strip */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor || '#D4AF37' }} />
      <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-all duration-500" />
      
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor || '#D4AF37' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor || '#D4AF37' }} />
        </span>
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold" style={{ color: primaryColor || '#D4AF37' }}>Interactive Demo Scan</span>
      </div>

      <h3 className="text-xl font-display font-extrabold text-white mb-1 uppercase tracking-tight">Scan / Route Link</h3>
      <p className="text-xs text-neutral-400 max-w-xs mb-5 font-semibold">
        Table <span className="font-mono font-black" style={{ color: primaryColor || '#D4AF37' }}>{tableNumber}</span> Smart QR Code
      </p>

      {/* QR Code Container with Gold Premium Border */}
      <div className="relative p-3 bg-neutral-950/80 rounded-[20px] border border-white/10 mb-5 transition-colors duration-300">
        <img
          src={qrImageUrl}
          alt={`Scan to order table ${tableNumber}`}
          className="w-44 h-44 rounded-lg object-contain bg-[#050505]"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Decorative corner brackets matching brand styles */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: primaryColor || '#D4AF37' }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: primaryColor || '#D4AF37' }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: primaryColor || '#D4AF37' }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: primaryColor || '#D4AF37' }} />
      </div>

      {/* Manual link fallback with icon */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-bold flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 border text-white transition-all duration-250 cursor-pointer"
        style={{ borderColor: `${primaryColor}40` || '#D4AF3740' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = primaryColor || '#D4AF37';
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${primaryColor}40` || '#D4AF3740';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Smartphone className="w-4 h-4" />
        <span>Open simulated mobile URL</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <div className="mt-4 flex items-center gap-3 text-neutral-500 text-[10px] font-mono font-medium">
        <div className="flex items-center gap-1">
          <QrCode className="w-3 h-3 text-zinc-600" />
          <span>Real mobile-scannable</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-zinc-600" />
          <span>Live PWA Sync</span>
        </div>
      </div>
    </div>
  );
}
