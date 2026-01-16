-- Add video column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS video TEXT;

-- Comment for documentation
COMMENT ON COLUMN products.video IS 'URL ของวิดีโอสินค้า (ถ้ามีจะแสดงเป็นสื่อหลักแทนรูปภาพ)';
