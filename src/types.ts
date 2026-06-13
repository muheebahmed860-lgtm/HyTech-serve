export type OrderStatus = 'New Order' | 'Preparing' | 'Ready' | 'Delivered';

export interface BrandingConfig {
  primaryColor: string; // Tailwind hex color (e.g. #D4AF37)
  accentColor: string;
  themeStyle: 'gold-classic' | 'emerald-minimal' | 'cyberpunk-neon' | 'cherry-bistro';
  tagline: string;
  logoPrompt?: string; 
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logoUrl: string;
  branding: BrandingConfig;
  subscriptionTier: 'Free' | 'Pro' | 'Enterprise';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  isVeg: boolean;
}

export interface Table {
  id: string;
  tenantId: string;
  tableNumber: string;
  label: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
  total: number;
  status: OrderStatus;
  timestamp: string; // ISO string
  voiceAnnounced?: boolean;
  pushedToMobile?: boolean;
}

export interface OwnerProfile {
  id: string;
  email: string;
  restaurantName?: string;
}
