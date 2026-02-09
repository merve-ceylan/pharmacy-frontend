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

    // STAFF endpoints
    staff: {
        getAll: (page: number = 0, size: number = 20, filter?: string) => {
            let url = `/staff/products?page=${page}&size=${size}`;
            if (filter && filter !== 'ALL') {
                url += `&filter=${filter}`;
            }
            return fetchApi(url);
        },

        getById: (id: number) =>
            fetchApi(`/staff/products/${id}`),

        create: (data: Record<string, unknown>) =>
            fetchApi('/staff/products', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: number, data: Record<string, unknown>) =>
            fetchApi(`/staff/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        updateStock: (id: number, quantity: number, reason?: string) =>
            fetchApi(`/staff/products/${id}/stock`, {
                method: 'PATCH',
                body: JSON.stringify({ quantity, reason }),
            }),

        toggleFeatured: (id: number, featured: boolean) =>
            fetchApi(`/staff/products/${id}/featured?featured=${featured}`, {
                method: 'PATCH',
            }),

        activate: (id: number) =>
            fetchApi(`/staff/products/${id}/activate`, {
                method: 'PATCH',
            }),

        deactivate: (id: number) =>
            fetchApi(`/staff/products/${id}/deactivate`, {
                method: 'PATCH',
            }),

        getLowStock: () =>
            fetchApi('/staff/products/low-stock'),

        getOutOfStock: () =>
            fetchApi('/staff/products/out-of-stock'),

        getCount: () =>
            fetchApi('/staff/products/count'),
        getStats: () =>
            fetchApi('/staff/products/stats'),
    },
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
    // Customer endpoints
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

    // Staff endpoints
    staff: {
        getAll: () =>
            fetchApi('/staff/orders'),

        getById: (orderNumber: string) =>
            fetchApi(`/staff/orders/${orderNumber}`),

        updateStatus: (orderNumber: string, status: string) =>
            fetchApi(`/staff/orders/${orderNumber}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            }),

        getStats: () =>
            fetchApi('/staff/orders/stats'),
    },
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
// SETTINGS
export const settingsApi = {
    get: () =>
        fetchApi('/admin/settings'),

    update: (settings: Record<string, unknown>) =>
        fetchApi('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        }),
};

// USERS (Admin)
export const usersApi = {
    getAll: (role?: string) =>
        fetchApi(role ? `/admin/users?role=${role}` : '/admin/users'),

    getById: (id: number) =>
        fetchApi(`/admin/users/${id}`),

    activate: (id: number) =>
        fetchApi(`/admin/users/${id}/activate`, {
            method: 'PATCH',
        }),

    deactivate: (id: number) =>
        fetchApi(`/admin/users/${id}/deactivate`, {
            method: 'PATCH',
        }),
};
// PHARMACIES (Admin)
export const pharmaciesApi = {
    getAll: () =>
        fetchApi('/admin/pharmacies'),

    getById: (id: number) =>
        fetchApi(`/admin/pharmacies/${id}`),

    getStats: (id: number, months: number = 6) =>
        fetchApi(`/admin/pharmacies/${id}/stats?months=${months}`),

    create: (data: Record<string, unknown>) =>
        fetchApi('/admin/pharmacies', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: number, data: Record<string, unknown>) =>
        fetchApi(`/admin/pharmacies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    suspend: (id: number) =>
        fetchApi(`/admin/pharmacies/${id}/suspend`, {
            method: 'PATCH',
        }),

    reactivate: (id: number) =>
        fetchApi(`/admin/pharmacies/${id}/reactivate`, {
            method: 'PATCH',
        }),
};
// DASHBOARD STATS
export const dashboardApi = {
    getAdminStats: () =>
        fetchApi('/admin/stats'),

    getPharmacyReports: (range: string = 'week') =>
        fetchApi(`/pharmacy/reports?range=${range}`),  // ✅ DOĞRU!
};