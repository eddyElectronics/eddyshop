import { supabase, DbProduct, DbCategory, DbVisitorLog } from './supabase';
import { Product } from './products';
import { Category } from './categories';

// Check if Supabase is configured
const hasSupabase = !!supabase;

// Helper to convert DB product to app product
function dbToProduct(db: DbProduct): Product {
  return {
    id: db.id,
    productCode: db.product_code,
    name: db.name,
    description: db.description,
    price: db.price,
    category: db.category,
    image: db.image,
    images: db.images || [],
    stock: db.stock ?? undefined,
    featured: db.featured,
    isUsed: db.is_used,
    sold: db.sold,
  };
}

// Helper to convert app product to DB product
function productToDb(product: Product): Partial<DbProduct> {
  return {
    id: product.id,
    product_code: product.productCode || '',
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image || product.images?.[0] || '',
    images: product.images || [],
    stock: product.stock ?? null,
    featured: product.featured,
    is_used: product.isUsed ?? false,
    sold: product.sold ?? false,
  };
}

// Helper to convert DB category to app category
function dbToCategory(db: DbCategory): Category {
  return {
    id: db.id,
    name: db.name,
    icon: db.icon,
    description: db.description,
  };
}

// Helper to convert app category to DB category
function categoryToDb(category: Category): Partial<DbCategory> {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
  };
}

// ===== PRODUCTS =====

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getProducts error:', error);
      return [];
    }

    return (data || []).map(dbToProduct);
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return;
  }

  try {
    // Delete all and re-insert
    const { error: deleteError } = await supabase!
      .from('products')
      .delete()
      .neq('id', '');

    if (deleteError) {
      console.error('Supabase delete products error:', deleteError);
    }

    if (products.length > 0) {
      const dbProducts = products.map(productToDb);
      const { error: insertError } = await supabase!
        .from('products')
        .insert(dbProducts);

      if (insertError) {
        console.error('Supabase insert products error:', insertError);
      }
    }
  } catch (error) {
    console.error('saveProducts error:', error);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase getProductById error:', error);
      return null;
    }

    return data ? dbToProduct(data) : null;
  } catch (error) {
    console.error('getProductById error:', error);
    return null;
  }
}

export async function addProduct(product: Product): Promise<Product> {
  if (!hasSupabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const dbProduct = productToDb(product);
    const { data, error } = await supabase!
      .from('products')
      .insert(dbProduct)
      .select()
      .single();

    if (error) {
      console.error('Supabase addProduct error:', error);
      throw error;
    }

    return data ? dbToProduct(data) : product;
  } catch (error) {
    console.error('addProduct error:', error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    // Convert updates to DB format
    const dbUpdates: Record<string, unknown> = {};
    if (updates.productCode !== undefined) dbUpdates.product_code = updates.productCode;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.isUsed !== undefined) dbUpdates.is_used = updates.isUsed;
    if (updates.sold !== undefined) dbUpdates.sold = updates.sold;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase!
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateProduct error:', error);
      return null;
    }

    return data ? dbToProduct(data) : null;
  } catch (error) {
    console.error('updateProduct error:', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase!
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteProduct error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteProduct error:', error);
    return false;
  }
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase getCategories error:', error);
      return [];
    }

    return (data || []).map(dbToCategory);
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return;
  }

  try {
    // Delete all and re-insert
    const { error: deleteError } = await supabase!
      .from('categories')
      .delete()
      .neq('id', '');

    if (deleteError) {
      console.error('Supabase delete categories error:', deleteError);
    }

    if (categories.length > 0) {
      const dbCategories = categories.map(categoryToDb);
      const { error: insertError } = await supabase!
        .from('categories')
        .insert(dbCategories);

      if (insertError) {
        console.error('Supabase insert categories error:', insertError);
      }
    }
  } catch (error) {
    console.error('saveCategories error:', error);
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase getCategoryById error:', error);
      return null;
    }

    return data ? dbToCategory(data) : null;
  } catch (error) {
    console.error('getCategoryById error:', error);
    return null;
  }
}

export async function addCategory(category: Category): Promise<Category> {
  console.log('addCategory called:', category);

  if (!hasSupabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const dbCategory = categoryToDb(category);
    const { data, error } = await supabase!
      .from('categories')
      .insert(dbCategory)
      .select()
      .single();

    if (error) {
      console.error('Supabase addCategory error:', error);
      throw error;
    }

    console.log('Category saved successfully');
    return data ? dbToCategory(data) : category;
  } catch (error) {
    console.error('addCategory error:', error);
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    const dbUpdates: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    
    const { data, error } = await supabase!
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateCategory error:', error);
      return null;
    }

    return data ? dbToCategory(data) : null;
  } catch (error) {
    console.error('updateCategory error:', error);
    return null;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase!
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteCategory error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteCategory error:', error);
    return false;
  }
}

// ===== VISITOR LOGS =====

export interface VisitorLog {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  pageUrl: string;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  sessionId: string | null;
  visitedAt: string;
}

// Helper to convert DB visitor log to app visitor log
function dbToVisitorLog(db: DbVisitorLog): VisitorLog {
  return {
    id: db.id,
    ipAddress: db.ip_address,
    userAgent: db.user_agent,
    referrer: db.referrer,
    pageUrl: db.page_url,
    country: db.country,
    city: db.city,
    deviceType: db.device_type,
    browser: db.browser,
    os: db.os,
    sessionId: db.session_id,
    visitedAt: db.visited_at,
  };
}

export async function addVisitorLog(log: Omit<VisitorLog, 'id' | 'visitedAt'>): Promise<VisitorLog | null> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    const dbLog = {
      ip_address: log.ipAddress,
      user_agent: log.userAgent,
      referrer: log.referrer,
      page_url: log.pageUrl,
      country: log.country,
      city: log.city,
      device_type: log.deviceType,
      browser: log.browser,
      os: log.os,
      session_id: log.sessionId,
    };

    const { data, error } = await supabase!
      .from('visitor_logs')
      .insert(dbLog)
      .select()
      .single();

    if (error) {
      console.error('Supabase addVisitorLog error:', error);
      return null;
    }

    return data ? dbToVisitorLog(data) : null;
  } catch (error) {
    console.error('addVisitorLog error:', error);
    return null;
  }
}

export async function getVisitorLogs(options?: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}): Promise<{ logs: VisitorLog[]; total: number }> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return { logs: [], total: 0 };
  }

  try {
    let query = supabase!
      .from('visitor_logs')
      .select('*', { count: 'exact' })
      .order('visited_at', { ascending: false });

    if (options?.startDate) {
      query = query.gte('visited_at', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('visited_at', options.endDate);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase getVisitorLogs error:', error);
      return { logs: [], total: 0 };
    }

    return {
      logs: data ? data.map(dbToVisitorLog) : [],
      total: count || 0,
    };
  } catch (error) {
    console.error('getVisitorLogs error:', error);
    return { logs: [], total: 0 };
  }
}

export async function getVisitorStats(): Promise<{
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  topPages: { pageUrl: string; count: number }[];
  deviceStats: { deviceType: string; count: number }[];
  browserStats: { browser: string; count: number }[];
}> {
  if (!hasSupabase) {
    console.error('Supabase not configured');
    return {
      totalVisits: 0,
      todayVisits: 0,
      uniqueVisitors: 0,
      topPages: [],
      deviceStats: [],
      browserStats: [],
    };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Get total visits
    const { count: totalVisits } = await supabase!
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true });

    // Get today's visits
    const { count: todayVisits } = await supabase!
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', todayStr);

    // Get all logs for aggregation
    const { data: allLogs } = await supabase!
      .from('visitor_logs')
      .select('ip_address, page_url, device_type, browser');

    // Calculate unique visitors by IP
    const uniqueIps = new Set(allLogs?.map(l => l.ip_address).filter(Boolean));
    
    // Calculate top pages
    const pageCounts: Record<string, number> = {};
    allLogs?.forEach(l => {
      if (l.page_url) {
        pageCounts[l.page_url] = (pageCounts[l.page_url] || 0) + 1;
      }
    });
    const topPages = Object.entries(pageCounts)
      .map(([pageUrl, count]) => ({ pageUrl, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate device stats
    const deviceCounts: Record<string, number> = {};
    allLogs?.forEach(l => {
      const device = l.device_type || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const deviceStats = Object.entries(deviceCounts)
      .map(([deviceType, count]) => ({ deviceType, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate browser stats
    const browserCounts: Record<string, number> = {};
    allLogs?.forEach(l => {
      const browser = l.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    const browserStats = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVisits: totalVisits || 0,
      todayVisits: todayVisits || 0,
      uniqueVisitors: uniqueIps.size,
      topPages,
      deviceStats,
      browserStats,
    };
  } catch (error) {
    console.error('getVisitorStats error:', error);
    return {
      totalVisits: 0,
      todayVisits: 0,
      uniqueVisitors: 0,
      topPages: [],
      deviceStats: [],
      browserStats: [],
    };
  }
}
