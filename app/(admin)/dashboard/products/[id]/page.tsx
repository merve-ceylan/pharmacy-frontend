'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        shortDescription: '',
        price: '',
        discountedPrice: '',
        stockQuantity: '',
        lowStockThreshold: '',
        categoryId: '',
        featured: false,
        requiresPrescription: false,
        active: true,
    });

    useEffect(() => {
        checkAuth();
        loadCategories();
        loadProduct();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        }
    };

    const loadCategories = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/public/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (err) {
            console.error('Kategoriler yüklenemedi', err);
        }
    };

    const loadProduct = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/staff/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const product = data.data || data;
                setFormData({
                    name: product.name || '',
                    sku: product.sku || '',
                    barcode: product.barcode || '',
                    description: product.description || '',
                    shortDescription: product.shortDescription || '',
                    price: product.price?.toString() || '',
                    discountedPrice: product.discountedPrice?.toString() || '',
                    stockQuantity: product.stockQuantity?.toString() || '',
                    lowStockThreshold: product.lowStockThreshold?.toString() || '10',
                    categoryId: product.categoryId?.toString() || '',
                    featured: product.featured || false,
                    requiresPrescription: product.requiresPrescription || false,
                    active: product.active !== false,
                });
            }
        } catch (err) {
            console.error('Ürün yükleme hatası', err);
            setError('Ürün yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const token = localStorage.getItem('accessToken');

        try {
            const res = await fetch(`http://localhost:8080/api/staff/products/${productId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
                    stockQuantity: parseInt(formData.stockQuantity),
                    lowStockThreshold: parseInt(formData.lowStockThreshold),
                    categoryId: parseInt(formData.categoryId),
                }),
            });

            if (res.ok) {
                router.push('/dashboard/products');
            } else {
                const data = await res.json();
                setError(data.message || 'Ürün güncellenemedi');
            }
        } catch (err) {
            console.error('Ürün güncelleme hatası', err);
            setError('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/products" className="text-gray-500 hover:text-gray-700">
                            ← Geri
                        </Link>
                        <h1 className="text-2xl font-bold">✏️ Ürün Düzenle</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Ürün Adı *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 mb-2">SKU *</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Barkod</label>
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Kategori *</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Kategori Seçin</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Kısa Açıklama</label>
                            <input
                                type="text"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Açıklama</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Fiyat (TL) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">İndirimli Fiyat (TL)</label>
                                <input
                                    type="number"
                                    name="discountedPrice"
                                    value={formData.discountedPrice}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Stok Miktarı *</label>
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    value={formData.stockQuantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Düşük Stok Eşiği</label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    value={formData.lowStockThreshold}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-6 mb-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="w-5 h-5"
                                />
                                <span>Öne Çıkan Ürün</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="requiresPrescription"
                                    checked={formData.requiresPrescription}
                                    onChange={handleChange}
                                    className="w-5 h-5"
                                />
                                <span>Reçete Gerekli</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    className="w-5 h-5"
                                />
                                <span>Aktif</span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                            >
                                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                            <Link
                                href="/dashboard/products"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-center"
                            >
                                İptal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}