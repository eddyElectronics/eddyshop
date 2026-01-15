// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
} as const;

// App Configuration
export const APP_CONFIG = {
  name: 'EddyShop',
  currency: 'THB',
  locale: 'th-TH',
  freeShippingThreshold: 1000,
  shippingFee: 50,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  cart: 'eddyshop_cart',
  theme: 'eddyshop_theme',
  user: 'eddyshop_user',
} as const;

// Routes
export const ROUTES = {
  home: '/',
  products: '/products',
  cart: '/cart',
  admin: '/admin',
  adminLogin: '/admin/login',
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
