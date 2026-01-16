import { supabase, DbProduct, DbCategory } from './supabase';
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
