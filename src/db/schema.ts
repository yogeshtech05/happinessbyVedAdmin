export const CREATE_TABLES_SQL = `
-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id VARCHAR(64) NOT NULL,
  role_name VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  avatar_url TEXT,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  permissions TEXT NOT NULL, -- JSON array of codes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  phone VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  city VARCHAR(64),
  address TEXT,
  pincode VARCHAR(16),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  tagline TEXT,
  icon VARCHAR(64),
  package_count INT DEFAULT 0,
  gradient TEXT,
  accent_color VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  occasion VARCHAR(64) NOT NULL,
  occasion_label VARCHAR(64) NOT NULL,
  category VARCHAR(128) NOT NULL,
  tagline TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  compare_at_price NUMERIC(10, 2),
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  popular BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  badge VARCHAR(64),
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT NOT NULL, -- JSON array
  inclusions TEXT NOT NULL, -- JSON array
  features TEXT NOT NULL,   -- JSON array
  addons TEXT NOT NULL,     -- JSON array
  duration VARCHAR(64) DEFAULT '30-45 Mins',
  image_theme VARCHAR(32) DEFAULT 'rose',
  visual_icon VARCHAR(64) DEFAULT 'Cake',
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table (Inventory items: Cakes, Flowers, Gifts, Addons)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2),
  sku VARCHAR(64) UNIQUE NOT NULL,
  stock_quantity INT DEFAULT 100,
  is_available BOOLEAN DEFAULT TRUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  recipient_name VARCHAR(128) NOT NULL,
  recipient_phone VARCHAR(32) NOT NULL,
  delivery_address TEXT NOT NULL,
  city VARCHAR(64) NOT NULL,
  pincode VARCHAR(16) NOT NULL,
  landmark TEXT,
  delivery_date VARCHAR(32) NOT NULL,
  delivery_time_slot VARCHAR(64) NOT NULL,
  occasion VARCHAR(64) NOT NULL,
  presenter_required BOOLEAN DEFAULT TRUE,
  presenter_note TEXT,
  special_instructions TEXT,
  items TEXT NOT NULL, -- JSON array of items
  subtotal NUMERIC(10, 2) NOT NULL,
  addons_total NUMERIC(10, 2) DEFAULT 0.00,
  delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PAID',
  payment_method VARCHAR(32) DEFAULT 'Razorpay',
  assigned_staff_id VARCHAR(64),
  assigned_staff_name VARCHAR(128),
  internal_notes TEXT,
  timeline TEXT NOT NULL, -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  order_number VARCHAR(64) NOT NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  recipient_name VARCHAR(128) NOT NULL,
  recipient_phone VARCHAR(32) NOT NULL,
  delivery_address TEXT NOT NULL,
  city VARCHAR(64) NOT NULL,
  pincode VARCHAR(16) NOT NULL,
  delivery_date VARCHAR(32) NOT NULL,
  delivery_time_slot VARCHAR(64) NOT NULL,
  assigned_presenter_id VARCHAR(64),
  assigned_presenter_name VARCHAR(128),
  status VARCHAR(32) NOT NULL DEFAULT 'UNASSIGNED',
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE',
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0.00,
  max_discount_amount NUMERIC(10, 2),
  usage_limit INT DEFAULT 100,
  usage_count INT DEFAULT 0,
  start_date VARCHAR(32) NOT NULL,
  expiry_date VARCHAR(32) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64),
  package_id VARCHAR(64),
  package_name VARCHAR(128),
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(128) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'APPROVED',
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  target_audience VARCHAR(64) DEFAULT 'ALL_CUSTOMERS',
  recipient_id VARCHAR(64),
  sent_by VARCHAR(128) NOT NULL,
  status VARCHAR(32) DEFAULT 'SENT',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Blocks Table (CMS)
CREATE TABLE IF NOT EXISTS cms_content (
  id VARCHAR(64) PRIMARY KEY,
  section_key VARCHAR(64) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  metadata TEXT, -- JSON
  updated_by VARCHAR(128) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NOT NULL,
  admin_name VARCHAR(128) NOT NULL,
  admin_email VARCHAR(128) NOT NULL,
  action VARCHAR(128) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64),
  details TEXT NOT NULL,
  ip_address VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id VARCHAR(32) PRIMARY KEY DEFAULT 'main',
  business_name VARCHAR(128) NOT NULL DEFAULT 'Happiness Deliver',
  brand_tagline VARCHAR(255) DEFAULT 'Premium Surprise Gifting & Doorstep Delivery',
  helpline_phone VARCHAR(32) DEFAULT '+91 98765 43210',
  helpline_email VARCHAR(128) DEFAULT 'hello@happinessdeliver.com',
  address TEXT DEFAULT '100 Executive Boulevard, Suite 400',
  city VARCHAR(64) DEFAULT 'Mumbai',
  state VARCHAR(64) DEFAULT 'Maharashtra',
  pincode VARCHAR(16) DEFAULT '400001',
  currency_symbol VARCHAR(8) DEFAULT '₹',
  tax_rate_percent NUMERIC(5, 2) DEFAULT 18.00,
  default_delivery_fee NUMERIC(8, 2) DEFAULT 0.00,
  free_delivery_threshold NUMERIC(10, 2) DEFAULT 1000.00,
  order_prefix VARCHAR(16) DEFAULT 'HD-',
  allow_same_day_booking BOOLEAN DEFAULT TRUE,
  booking_cutoff_time VARCHAR(16) DEFAULT '18:00',
  auto_assign_presenters BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
