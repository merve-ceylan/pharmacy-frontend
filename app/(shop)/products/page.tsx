'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi, cartApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/types';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingToCart, setAddingToCart] = useState<number | null>(null);

    const [filters, setFilters] = useState({
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        sortBy: 'name',
        sortDir: 'asc',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [searchQuery, filters]);

    const loadCategories = async () => {
        try {
            const response = await categoriesApi.getAll();
            setCategories(response || []);
        } catch (err) {
            console.error('Kategoriler yüklenemedi');
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            let response;
            if (searchQuery) {
                response = await productsApi.search(1, searchQuery);
            } else {
                response = await productsApi.getAll(1);
            }
            let productList = response.content || response || [];

            // Client-side filtering
            if (filters.categoryId) {
                productList = productList.filter((p: Product) => p.categoryId === parseInt(filters.categoryId));
            }
            if (filters.minPrice) {
                productList = productList.filter((p: Product) => (p.discountedPrice || p.price) >= parseFloat(filters.minPrice));
            }
            if (filters.maxPrice) {
                productList = productList.filter((p: Product) => (p.discountedPrice || p.price) <= parseFloat(filters.maxPrice));
            }
            if (filters.inStock) {
                productList = productList.filter((p: Product) => p.inStock);
            }

            // Sorting
            productList.sort((a: Product, b: Product) => {
                let aVal, bVal;
                if (filters.sortBy === 'price') {
                    aVal = a.discountedPrice || a.price;
                    bVal = b.discountedPrice || b.price;
                } else {
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                }
                if (aVal < bVal) return filters.sortDir === 'asc' ? -1 : 1;
                if (aVal > bVal) return filters.sortDir === 'asc' ? 1 : -1;
                return 0;
            });

            setProducts(productList);
        } catch (err: any) {
            setError(err.message || 'Ürünler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: number) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        setAddingToCart(productId);
        try {
            await cartApi.addItem(1, productId, 1);
            alert('Ürün sepete eklendi!');
        } catch (err: any) {
            alert(err.message || 'Sepete eklenemedi');
        } finally {
            setAddingToCart(null);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            sortBy: 'name',
            sortDir: 'asc',
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg">Filtreler</h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Temizle
                                </button>
                            </div>

                            {/* Kategori */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 text-sm font-medium">Kategori</label>
                                <select
                                    value={filters.categoryId}
                                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Tümü</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fiyat Aralığı */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 text-sm font-medium">Fiyat Aralığı</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Stokta Var */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Sadece stokta olanlar</span>
                                </label>
                            </div>

                            {/* Sıralama */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 text-sm font-medium">Sıralama</label>
                                <select
                                    value={`${filters.sortBy}-${filters.sortDir}`}
                                    onChange={(e) => {
                                        const [sortBy, sortDir] = e.target.value.split('-');
                                        setFilters({ ...filters, sortBy, sortDir });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name-asc">İsim (A-Z)</option>
                                    <option value="name-desc">İsim (Z-A)</option>
                                    <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                                    <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold">
                                {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Ürünler'}
                            </h1>
                            <span className="text-gray-500">{products.length} ürün</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-xl">Yükleniyor...</div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-600 py-8">{error}</div>
                        ) : products.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p className="text-lg mb-2">Ürün bulunamadı</p>
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:underline"
                                >
                                    Filtreleri temizle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                                    >
                                        <a href={`/products/${product.slug}`} className="block">
                                            <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
                                                💊
                                            </div>
                                        </a>

                                        <div className="p-4">
                                            <a href={`/products/${product.slug}`}>
                                                <h2 className="text-lg font-semibold mb-2 hover:text-blue-600">
                                                    {product.name}
                                                </h2>
                                            </a>

                                            <p className="text-gray-500 text-sm mb-2">{product.categoryName}</p>

                                            <div className="flex items-center gap-2 mb-2">
                                                {product.discountedPrice ? (
                                                    <>
                            <span className="text-gray-400 line-through">
                              {product.price.toFixed(2)} TL
                            </span>
                                                        <span className="text-green-600 font-bold">
                              {product.discountedPrice.toFixed(2)} TL
                            </span>
                                                    </>
                                                ) : (
                                                    <span className="font-bold">{product.price.toFixed(2)} TL</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mb-4">
                                                {product.inStock ? (
                                                    <span className="text-green-600 text-sm">✓ Stokta</span>
                                                ) : (
                                                    <span className="text-red-600 text-sm">✗ Stokta Yok</span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(product.id)}
                                                disabled={!product.inStock || addingToCart === product.id}
                                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                            >
                                                {addingToCart === product.id ? 'Ekleniyor...' : 'Sepete Ekle'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}