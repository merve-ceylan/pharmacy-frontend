'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    discountedPrice?: number;
    stockQuantity: number;
    active: boolean;
    featured: boolean;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(userData);
        if (user.role !== 'PHARMACY_OWNER' && user.role !== 'STAFF') {
            router.push('/');
            return;
        }
        loadProducts();
    }, [router]);

    const loadProducts = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://localhost:8080/api/staff/products?size=100', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data.content || []);
            }
        } catch (err) {
            showError('Ürünler yüklenemedi');
            console.error('Products load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (productId: number, currentActive: boolean) => {
        const token = localStorage.getItem('accessToken');
        const endpoint = currentActive ? 'deactivate' : 'activate';

        setTogglingId(productId);
        try {
            const res = await fetch(`http://localhost:8080/api/staff/products/${productId}/${endpoint}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showSuccess(currentActive ? 'Ürün pasif yapıldı' : 'Ürün aktif yapıldı');
                loadProducts();
            } else {
                showError('İşlem başarısız');
            }
        } catch (err) {
            showError('İşlem başarısız');
            console.error('Toggle error:', err);
        } finally {
            setTogglingId(null);
        }
    };

    const filteredProducts = products.filter(p => {
        if (filter === 'ACTIVE') return p.active;
        if (filter === 'PASSIVE') return !p.active;
        if (filter === 'LOW_STOCK') return p.stockQuantity < 10;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Header Skeleton */}
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton width="60px" height="24px" />
                            <Skeleton width="180px" height="32px" />
                        </div>
                        <Skeleton width="120px" height="40px" variant="rectangular" />
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <Skeleton width="80px" height="16px" className="mb-2" />
                                <Skeleton width="60px" height="32px" />
                            </div>
                        ))}
                    </div>

                    {/* Filter Skeleton */}
                    <Skeleton width="200px" height="40px" className="mb-4" variant="rectangular" />

                    {/* Table Skeleton */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left"><Skeleton width="60px" height="16px" /></th>
                                <th className="px-6 py-3 text-left"><Skeleton width="40px" height="16px" /></th>
                                <th className="px-6 py-3 text-left"><Skeleton width="50px" height="16px" /></th>
                                <th className="px-6 py-3 text-left"><Skeleton width="40px" height="16px" /></th>
                                <th className="px-6 py-3 text-left"><Skeleton width="50px" height="16px" /></th>
                                <th className="px-6 py-3 text-left"><Skeleton width="70px" height="16px" /></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton variant="circular" width="40px" height="40px" />
                                            <Skeleton width="150px" height="20px" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Skeleton width="80px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="70px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="40px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="60px" height="24px" variant="rectangular" /></td>
                                    <td className="px-6 py-4"><Skeleton width="100px" height="20px" /></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Geri
                        </Link>
                        <h1 className="text-2xl font-bold">📦 Ürün Yönetimi</h1>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/products/new')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Yeni Ürün
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Toplam Ürün</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Aktif</p>
                        <p className="text-2xl font-bold text-green-600">{products.filter(p => p.active).length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Pasif</p>
                        <p className="text-2xl font-bold text-red-600">{products.filter(p => !p.active).length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Düşük Stok</p>
                        <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.stockQuantity < 10).length}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Tüm Ürünler ({products.length})</option>
                        <option value="ACTIVE">Aktif Ürünler ({products.filter(p => p.active).length})</option>
                        <option value="PASSIVE">Pasif Ürünler ({products.filter(p => !p.active).length})</option>
                        <option value="LOW_STOCK">Düşük Stok ({products.filter(p => p.stockQuantity < 10).length})</option>
                    </select>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">📦</div>
                                    {filter === 'ALL' ? 'Henüz ürün bulunmuyor' : 'Bu filtreye uygun ürün yok'}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className={`hover:bg-gray-50 transition ${!product.active ? 'bg-gray-50 opacity-60' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">💊</span>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                {product.featured && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Öne Çıkan
                            </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{product.sku}</td>
                                    <td className="px-6 py-4">
                                        {product.discountedPrice ? (
                                            <div>
                                                <span className="text-gray-400 line-through text-sm">{product.price.toFixed(2)} TL</span>
                                                <br />
                                                <span className="text-green-600 font-medium">{product.discountedPrice.toFixed(2)} TL</span>
                                            </div>
                                        ) : (
                                            <span>{product.price.toFixed(2)} TL</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                          product.stockQuantity === 0 ? 'text-red-600' :
                              product.stockQuantity < 10 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {product.stockQuantity}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Aktif' : 'Pasif'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => toggleActive(product.id, product.active)}
                                                disabled={togglingId === product.id}
                                                className={`text-sm ${product.active ? 'text-red-600' : 'text-green-600'} hover:underline disabled:opacity-50`}
                                            >
                                                {togglingId === product.id ? '...' : product.active ? 'Pasif Yap' : 'Aktif Yap'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}