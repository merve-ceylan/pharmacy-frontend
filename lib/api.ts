const API_URL = 'http://localhost:8080/api';

// Token'ı localStorage'dan al
function getToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
}

// API istekleri için genel fonksiyon
async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Bir hata oluştu');
    }

    // DELETE ve bazı istekler boş yanıt dönebilir
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    // Boş yanıt için null dön
    return null;
}

// AUTH
export const authApi = {
    login: (email: string, password: string) =>
        fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
    }) =>
        fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    me: () => fetchApi('/auth/me'),
};

// PRODUCTS
export const productsApi = {
    getAll: (pharmacyId: number = 1) =>
        fetchApi(`/public/pharmacies/${pharmacyId}/products`),

    getBySlug: (pharmacyId: number, slug: string) =>
        fetchApi(`/public/pharmacies/${pharmacyId}/products/slug/${slug}`),

    getFeatured: (pharmacyId: number = 1) =>
        fetchApi(`/public/pharmacies/${pharmacyId}/products/featured`),

    search: (pharmacyId: number, query: string) =>
        fetchApi(`/public/pharmacies/${pharmacyId}/products/search?q=${query}`),
};

// CART
export const cartApi = {
    get: (pharmacyId: number = 1) =>
        fetchApi(`/customer/cart/${pharmacyId}`),

    addItem: (pharmacyId: number, productId: number, quantity: number) =>
        fetchApi(`/customer/cart/${pharmacyId}/items`, {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        }),

    updateItem: (pharmacyId: number, itemId: number, quantity: number) =>
        fetchApi(`/customer/cart/${pharmacyId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        }),

    removeItem: (pharmacyId: number, itemId: number) =>
        fetchApi(`/customer/cart/${pharmacyId}/items/${itemId}`, {
            method: 'DELETE',
        }),

    clear: (pharmacyId: number) =>
        fetchApi(`/customer/cart/${pharmacyId}`, {
            method: 'DELETE',
        }),
};

// ORDERS
export const ordersApi = {
    create: (data: Record<string, unknown>) =>
        fetchApi('/customer/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getMyOrders: () => fetchApi('/customer/orders'),

    getByOrderNumber: (orderNumber: string) =>
        fetchApi(`/customer/orders/${orderNumber}`),

    cancel: (orderNumber: string) =>
        fetchApi(`/customer/orders/${orderNumber}/cancel`, { method: 'POST' }),
};

// CATEGORIES
export const categoriesApi = {
    getAll: () => fetchApi('/public/categories'),
};

// FAVORITES
export const favoritesApi = {
    getAll: () => fetchApi('/customer/favorites'),

    add: (productId: number) =>
        fetchApi('/customer/favorites', {
            method: 'POST',
            body: JSON.stringify({ productId }),
        }),

    remove: (favoriteId: number) =>
        fetchApi(`/customer/favorites/${favoriteId}`, {
            method: 'DELETE',
        }),

    check: (productId: number) =>
        fetchApi(`/customer/favorites/check/${productId}`),
};

// ADDRESSES
export const addressesApi = {
    getAll: () => fetchApi('/customer/addresses'),

    create: (data: Record<string, unknown>) =>
        fetchApi('/customer/addresses', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: number, data: Record<string, unknown>) =>
        fetchApi(`/customer/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        fetchApi(`/customer/addresses/${id}`, {
            method: 'DELETE',
        }),

    setDefault: (id: number) =>
        fetchApi(`/customer/addresses/${id}/default`, {
            method: 'PATCH',
        }),
};