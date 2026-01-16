import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging
console.log('Supabase config check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) : 'none'
});

// Only create client if credentials are available
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

console.log('Supabase client created:', !!supabase);

// Database types
export interface DbProduct {
  id: string;
  product_code: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  stock: number | null;
  featured: boolean;
  is_used: boolean;
  sold: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Visitor log type
export interface DbVisitorLog {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  page_url: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  session_id: string | null;
  visited_at: string;
}
