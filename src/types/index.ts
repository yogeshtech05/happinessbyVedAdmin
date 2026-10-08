export type RoleName = "Super Admin" | "Admin" | "Manager" | "Staff";

export interface Permission {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
}

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  isSystem: boolean;
  permissions: string[]; // Permission codes
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: RoleName;
  permissions: string[];
  avatarUrl?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  totalOrders: number;
  totalSpent: number;
  city?: string;
  address?: string;
  pincode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OccasionType =
  | "birthday"
  | "anniversary"
  | "parents"
  | "romantic"
  | "congratulations"
  | "festivals";

export interface PackageAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PackageFeature {
  title: string;
  included: boolean;
}

export interface PackageItem {
  id: string;
  slug: string;
  title: string;
  name?: string;
  occasion: OccasionType;
  occasionLabel: string;
  category: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  popular: boolean;
  featured: boolean;
  isFeatured: boolean;
  isActive: boolean;
  badge?: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  features: PackageFeature[];
  addons: PackageAddon[];
  duration: string;
  imageTheme: "pink" | "gold" | "rose" | "plum" | "amber" | "emerald";
  visualIcon: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: "Gifts" | "Cakes" | "Flowers" | "Gift Packing" | "Presenters" | "Add-ons" | "Photography";
  price: number;
  costPrice?: number;
  sku: string;
  stockQuantity: number;
  isAvailable: boolean;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

export interface OrderItem {
  packageId: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  selectedAddons: { id: string; name: string; price: number }[];
  customMessage?: string;
  recipientName?: string;
  totalPrice: number;
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  note: string;
  updatedBy: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  landmark?: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  occasion: string;
  presenterRequired: boolean;
  presenterNote?: string;
  specialInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  addonsTotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  internalNotes?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  assignedPresenterId?: string;
  assignedPresenterName?: string;
  status: DeliveryStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  packageId?: string;
  packageName?: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  isFeatured: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  targetAudience: "ALL_CUSTOMERS" | "SPECIFIC_CUSTOMER" | "ADMINS";
  recipientId?: string;
  sentBy: string;
  status: "SENT" | "SCHEDULED" | "FAILED";
  sentAt: string;
  createdAt: string;
}

export interface CMSContentBlock {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  metaData?: Record<string, any>;
  updatedBy: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface StoreSettings {
  businessName: string;
  brandTagline: string;
  helplinePhone: string;
  helplineEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  currencySymbol: string;
  taxRatePercent: number;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  orderPrefix: string;
  allowSameDayBooking: boolean;
  bookingCutoffTime: string;
  autoAssignPresenters: boolean;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  upcomingSurprises: number;
  pendingDeliveries: number;
  activePackages: number;
}
