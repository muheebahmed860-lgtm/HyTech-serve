import { createClient } from '@supabase/supabase-js';
import { Tenant, MenuItem, Table, Order, OrderStatus } from '../types';

// Read values from Vite environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Initialize client if configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Seeds for Restaurants/Tenants
const DEFAULT_BRANDINGS = {
  imperial: {
    primaryColor: '#D4AF37', // Gold
    accentColor: '#1A1A1A',
    themeStyle: 'gold-classic' as const,
    tagline: 'Imperial dining with majestic gold legacy',
    logoPrompt: 'royal plate with golden fork and knife, sleek luxury style'
  },
  bella: {
    primaryColor: '#10B981', // Emerald
    accentColor: '#059669',
    themeStyle: 'emerald-minimal' as const,
    tagline: 'Authentic stoneground Napoletana experience',
    logoPrompt: 'minimalist emerald basil leaf over steaming pizza circle'
  },
  cyber: {
    primaryColor: '#F43F5E', // Rose/Neon Neon
    accentColor: '#9333EA',
    themeStyle: 'cyberpunk-neon' as const,
    tagline: 'Sizzling futuristic cyber-eats under neon rails',
    logoPrompt: 'neon burger with cyber circuits and glowing edges'
  },
  cherry: {
    primaryColor: '#EF4444', // Cherry red
    accentColor: '#B91C1C',
    themeStyle: 'cherry-bistro' as const,
    tagline: 'Traditional cozy gourmet street cafe',
    logoPrompt: 'two red juicy cherries on a warm rustic chalkboard background'
  }
};

const SEED_TENANTS: Tenant[] = [
  {
    id: 't-imperial',
    name: 'Imperial Dining',
    slug: 'imperial',
    ownerId: 'owner-1',
    logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80',
    branding: DEFAULT_BRANDINGS.imperial,
    subscriptionTier: 'Enterprise',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-bella',
    name: 'Bella Italia',
    slug: 'bella-italia',
    ownerId: 'owner-2',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80',
    branding: DEFAULT_BRANDINGS.bella,
    subscriptionTier: 'Pro',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-cyber',
    name: 'Cyber Munch-Z',
    slug: 'cybermunch',
    ownerId: 'owner-3',
    logoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80',
    branding: DEFAULT_BRANDINGS.cyber,
    subscriptionTier: 'Free',
    createdAt: new Date().toISOString()
  }
];

// Initial seed menu items
const SEED_MENU_ITEMS: MenuItem[] = [
  // --- Imperial ---
  { id: 'mi-1', tenantId: 't-imperial', name: 'Imperial Lamb Shanks', category: 'Main Course', price: 699, description: 'Slow-braised New Zealand lamb shanks in rich aromatic golden jus with saffron rice.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', badge: 'Signature', isVeg: false },
  { id: 'mi-2', tenantId: 't-imperial', name: 'Gold Wrapped Caviar', category: 'Appetizers', price: 999, description: 'Finest sturgeon caviar topped with edible 24-carat gold leaf on toasted mini sourdough blinis.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', badge: 'Prestige', isVeg: false },
  { id: 'mi-3', tenantId: 't-imperial', name: 'Saffron Risotto Veg', category: 'Main Course', price: 449, description: 'Creamy master arborio rice simmered in vegetable bullion, infused with authentic Kashmiri saffron strands.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80', badge: 'Bestseller', isVeg: true },
  { id: 'mi-4', tenantId: 't-imperial', name: 'Coorg Gold Brew', category: 'Beverages', price: 149, description: 'Single-origin estate bean espresso, topped with textured heavy cream and gourmet organic honey.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', isVeg: true },

  // --- Bella Italia ---
  { id: 'mi-5', tenantId: 't-bella', name: 'Neapolitan Wood Pizza', category: 'Pizzas', price: 349, description: 'A thin, flame-seared crust with sweet cherry tomato glaze, double fresh buffalo mozzarella, and cold-pressed extra virgin olive oil.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', badge: 'Tradizionale', isVeg: true },
  { id: 'mi-6', tenantId: 't-bella', name: 'Handmade Truffle Gnocchi', category: 'Pasta', price: 389, description: 'Pillowy light potato gnocchi tossed in a velvety butter sauce backstopped by white truffle oil.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', badge: 'Popular', isVeg: true },
  { id: 'mi-7', tenantId: 't-bella', name: 'Tiramisu Mascarpone', category: 'Desserts', price: 219, description: 'Layers of espresso-soaked ladyfingers wrapped in sweet whipped egg yolks and dense mascarpone cheese dust.', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', badge: 'House Special', isVeg: true },

  // --- Cyber Munch-Z ---
  { id: 'mi-8', tenantId: 't-cyber', name: 'Neon Glitched Burger', category: 'Burgers', price: 199, description: 'Lava-hot spicy premium chicken zinger double patty, glazed in neon-pink raspberry jalapeno syrup!', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', badge: 'GLITCHED', isVeg: false },
  { id: 'mi-9', tenantId: 't-cyber', name: 'Cyberpunk Loaded Fries', category: 'Sides', price: 139, description: 'Golden hand-cut fries doused in molten purple cheese sauce, blue-corn tortilla crumbs, and spicy green relish.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80', isVeg: true },
  { id: 'mi-10', tenantId: 't-cyber', name: 'Rad-Fluid Energizer', category: 'Drinks', price: 79, description: 'Carbonated cooling Blue Curacao mixed with crushed ginger-spark, served in a light-up souvenir flask.', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80', badge: '100% RADS', isVeg: true }
];

// Initial Table layouts
const SEED_TABLES: Table[] = [
  // Imperial
  { id: 'tb-1', tenantId: 't-imperial', tableNumber: '1', label: 'Grand Arch Window' },
  { id: 'tb-2', tenantId: 't-imperial', tableNumber: '5', label: 'Main VIP Salon' },
  { id: 'tb-3', tenantId: 't-imperial', tableNumber: '8', label: 'Pillar fireplace Accent' },
  { id: 'tb-4', tenantId: 't-imperial', tableNumber: '12', label: 'Courtyard Fountain Side' },
  { id: 'tb-5', tenantId: 't-imperial', tableNumber: '15', label: 'Executive Bar Seat' },

  // Bella
  { id: 'tb-6', tenantId: 't-bella', tableNumber: '1', label: 'Patio Vine Trellis' },
  { id: 'tb-7', tenantId: 't-bella', tableNumber: '2', label: 'Oven Counter' },
  { id: 'tb-8', tenantId: 't-bella', tableNumber: '3', label: 'Italian Piazza Side' },

  // Cyber
  { id: 'tb-9', tenantId: 't-cyber', tableNumber: '101', label: 'LED Wall Box A' },
  { id: 'tb-10', tenantId: 't-cyber', tableNumber: '202', label: 'Synthesizer Corner' }
];

// Seed Orders
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1',
    tenantId: 't-imperial',
    orderNumber: 'HT5902',
    tableNumber: '5',
    customerName: 'Sanjay Sen',
    items: [
      { menuItem: SEED_MENU_ITEMS[0], quantity: 1 }, // Lamb Shanks
      { menuItem: SEED_MENU_ITEMS[3], quantity: 2 }  // Coorg Gold Brew
    ],
    total: 997,
    status: 'New Order',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    voiceAnnounced: true,
    pushedToMobile: true
  },
  {
    id: 'ord-2',
    tenantId: 't-imperial',
    orderNumber: 'HT1121',
    tableNumber: '8',
    customerName: 'Ayesha Roy',
    items: [
      { menuItem: SEED_MENU_ITEMS[2], quantity: 2 } // Saffron Risotto
    ],
    total: 898,
    status: 'Preparing',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    voiceAnnounced: true,
    pushedToMobile: true
  },
  {
    id: 'ord-3',
    tenantId: 't-bella',
    orderNumber: 'IT9805',
    tableNumber: '2',
    customerName: 'Clarissa',
    items: [
      { menuItem: SEED_MENU_ITEMS[4], quantity: 1 }, // Wood Pizza
      { menuItem: SEED_MENU_ITEMS[6], quantity: 1 }  // Tiramisu
    ],
    total: 568,
    status: 'New Order',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    voiceAnnounced: false,
    pushedToMobile: true
  }
];

// Setup local-storage functions to behave synchronously like Database
const getLocalData = <T>(key: string, backup: T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(backup));
    return backup;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return backup;
  }
};

const saveLocalData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize fallbacks
getLocalData('saas_tenants', SEED_TENANTS);
getLocalData('saas_menu_items', SEED_MENU_ITEMS);
getLocalData('saas_tables', SEED_TABLES);
getLocalData('saas_orders', SEED_ORDERS);

// EXPORTED CRM DATABASE INTERFACE FOR ALL TENANT OPERATIONS
export const dbService = {
  // TENANTS api
  async getTenants(): Promise<Tenant[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.from('tenants').select('*');
      if (!error && data) return data as Tenant[];
    }
    return getLocalData<Tenant>('saas_tenants', SEED_TENANTS);
  },

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const list = await this.getTenants();
    return list.find(t => t.slug === slug || t.id === slug) || null;
  },

  async updateTenantBranding(tenantId: string, branding: Partial<Tenant['branding']>): Promise<Tenant | null> {
    const list = await this.getTenants();
    const updated = list.map(t => {
      if (t.id === tenantId) {
        return { ...t, branding: { ...t.branding, ...branding } as any };
      }
      return t;
    });
    saveLocalData('saas_tenants', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('tenants').update({ branding }).eq('id', tenantId);
    }
    return updated.find(t => t.id === tenantId) || null;
  },

  async updateTenantDetails(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const list = await this.getTenants();
    const updated = list.map(t => t.id === tenantId ? { ...t, ...updates } : t);
    saveLocalData('saas_tenants', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('tenants').update(updates).eq('id', tenantId);
    }
    return updated.find(t => t.id === tenantId) || null;
  },

  async createTenant(tenant: Tenant): Promise<Tenant> {
    const list = await this.getTenants();
    const updated = [tenant, ...list];
    saveLocalData('saas_tenants', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('tenants').insert(tenant);
    }
    return tenant;
  },

  // MENU ITEMS api
  async getMenuItems(tenantId?: string): Promise<MenuItem[]> {
    let list: MenuItem[] = [];
    if (isSupabaseConfigured && supabaseClient) {
      const query = supabaseClient.from('menu_items').select('*');
      if (tenantId) query.eq('tenantId', tenantId);
      const { data, error } = await query;
      if (!error && data) list = data as MenuItem[];
    } else {
      list = getLocalData<MenuItem>('saas_menu_items', SEED_MENU_ITEMS);
    }
    if (tenantId) {
      return list.filter(item => item.tenantId === tenantId);
    }
    return list;
  },

  async saveMenuItem(item: MenuItem): Promise<MenuItem> {
    const list = await this.getMenuItems();
    const existsIdx = list.findIndex(i => i.id === item.id);
    let updated: MenuItem[];
    if (existsIdx >= 0) {
      updated = [...list];
      updated[existsIdx] = item;
    } else {
      updated = [item, ...list];
    }
    saveLocalData('saas_menu_items', updated);

    if (isSupabaseConfigured && supabaseClient) {
      if (existsIdx >= 0) {
        await supabaseClient.from('menu_items').update(item).eq('id', item.id);
      } else {
        await supabaseClient.from('menu_items').insert(item);
      }
    }
    return item;
  },

  async deleteMenuItem(itemId: string): Promise<boolean> {
    const list = await this.getMenuItems();
    const updated = list.filter(i => i.id !== itemId);
    saveLocalData('saas_menu_items', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('menu_items').delete().eq('id', itemId);
    }
    return true;
  },

  // TABLES api
  async getTables(tenantId?: string): Promise<Table[]> {
    let list: Table[] = [];
    if (isSupabaseConfigured && supabaseClient) {
      const query = supabaseClient.from('tables').select('*');
      if (tenantId) query.eq('tenantId', tenantId);
      const { data, error } = await query;
      if (!error && data) list = data as Table[];
    } else {
      list = getLocalData<Table>('saas_tables', SEED_TABLES);
    }
    if (tenantId) {
      return list.filter(t => t.tenantId === tenantId);
    }
    return list;
  },

  async saveTable(table: Table): Promise<Table> {
    const list = await this.getTables();
    const existsIdx = list.findIndex(t => t.id === table.id);
    let updated: Table[];
    if (existsIdx >= 0) {
      updated = [...list];
      updated[existsIdx] = table;
    } else {
      updated = [...list, table];
    }
    saveLocalData('saas_tables', updated);

    if (isSupabaseConfigured && supabaseClient) {
      if (existsIdx >= 0) {
        await supabaseClient.from('tables').update(table).eq('id', table.id);
      } else {
        await supabaseClient.from('tables').insert(table);
      }
    }
    return table;
  },

  async deleteTable(tableId: string): Promise<boolean> {
    const list = await this.getTables();
    const updated = list.filter(t => t.id !== tableId);
    saveLocalData('saas_tables', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('tables').delete().eq('id', tableId);
    }
    return true;
  },

  // ORDERS api
  async getOrders(tenantId?: string): Promise<Order[]> {
    let list: Order[] = [];
    if (isSupabaseConfigured && supabaseClient) {
      const query = supabaseClient.from('orders').select('*');
      if (tenantId) query.eq('tenantId', tenantId);
      const { data, error } = await query;
      if (!error && data) list = data as Order[];
    } else {
      list = getLocalData<Order>('saas_orders', SEED_ORDERS);
    }
    if (tenantId) {
      return list.filter(o => o.tenantId === tenantId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async placeOrder(order: Order): Promise<Order> {
    const list = await this.getOrders();
    const updated = [order, ...list];
    saveLocalData('saas_orders', updated);

    // Call state update event manually for real-time emulation
    const customEvent = new CustomEvent('saas_order_update', { detail: order });
    window.dispatchEvent(customEvent);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('orders').insert(order);
    }
    return order;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order | null> {
    const list = await this.getOrders();
    const updated = list.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    saveLocalData('saas_orders', updated);

    const found = updated.find(o => o.id === orderId) || null;
    if (found) {
      const customEvent = new CustomEvent('saas_order_update', { detail: found });
      window.dispatchEvent(customEvent);
    }

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
    return found;
  },

  async setOrderVoiced(orderId: string): Promise<void> {
    const list = await this.getOrders();
    const updated = list.map(o => o.id === orderId ? { ...o, voiceAnnounced: true } : o);
    saveLocalData('saas_orders', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('orders').update({ voiceAnnounced: true }).eq('id', orderId);
    }
  },

  async setOrderPushed(orderId: string): Promise<void> {
    const list = await this.getOrders();
    const updated = list.map(o => o.id === orderId ? { ...o, pushedToMobile: true } : o);
    saveLocalData('saas_orders', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('orders').update({ pushedToMobile: true }).eq('id', orderId);
    }
  },

  // Clear delivered orders helper
  async clearDeliveredOrders(tenantId: string): Promise<void> {
    const list = await this.getOrders();
    const updated = list.filter(o => !(o.tenantId === tenantId && o.status === 'Delivered'));
    saveLocalData('saas_orders', updated);

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('orders').delete().eq('tenantId', tenantId).eq('status', 'Delivered');
    }
  }
};
