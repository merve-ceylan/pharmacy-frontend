// User
export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'SUPER_ADMIN' | 'PHARMACY_OWNER' | 'STAFF' | 'CUSTOMER';
    active: boolean;
    emailVerified: boolean;
    pharmacyId?: number;
    pharmacyName?: string;
}

// Product
export interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    description?: string;
    shortDescription?: string;
    price: number;
    discountedPrice?: number;
    effectivePrice: number;
    discountPercentage?: number;
    stockQuantity: number;
    lowStockThreshold: number;
    inStock: boolean;
    lowStock: boolean;
    categoryId: number;
    categoryName: string;
    pharmacyId: number;
    pharmacyName: string;
    imageUrl?: string;
    featured: boolean;
    active: boolean;
}

// Category
export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: number;
    children?: Category[];
    productCount?: number;
    active: boolean;
}

// Cart
export interface CartItem {
    id: number;
    productId: number;
    productName: string;
    productSlug: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    discountedPrice?: number;
    effectivePrice: number;
    totalPrice: number;
    availableStock: number;
    inStock: boolean;
    available: boolean;
}

export interface Cart {
    id: number;
    pharmacyId: number;
    pharmacyName: string;
    items: CartItem[];
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    estimatedShipping: number;
    estimatedTotal: number;
    hasUnavailableItems: boolean;
    updatedAt: string;
}

// Order
export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    deliveryType: 'COURIER' | 'CARGO';
    customerId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    pharmacyId: number;
    pharmacyName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingDistrict: string;
    shippingPostalCode: string;
    shippingPhone: string;
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    items?: OrderItem[];
    itemCount: number;
    notes?: string;
    trackingNumber?: string;
    cargoCompany?: string;
    createdAt: string;
    confirmedAt?: string;
    preparingAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancellable: boolean;
}

// API Response
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}