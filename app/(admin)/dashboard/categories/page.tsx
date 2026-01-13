'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    active: boolean;
}

export default function AdminCategoriesPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(userData);
        setUserRole(user.role);

        if (!['SUPER_ADMIN', 'PHARMACY_OWNER', 'STAFF'].includes(user.role)) {
            router.push('/');
            return;
        }
        loadCategories();
    }, [router]);

    const loadCategories = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/public/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err);
            showError('Kategoriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const token = localStorage.getItem('accessToken');

        const slug = formData.slug || formData.name.toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        const url = editingCategory
            ? `http://localhost:8080/api/admin/categories/${editingCategory.id}`
            : 'http://localhost:8080/api/admin/categories';
        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    slug: slug,
                    description: formData.description || null,
                }),
            });

            if (res.ok) {
                showSuccess(editingCategory ? 'Kategori güncellendi!' : 'Kategori eklendi!');
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', slug: '', description: '' });
                loadCategories();
            } else {
                const data = await res.json().catch(() => ({}));
                if (res.status === 403) {
                    showError('Bu işlem için yetkiniz yok. Sadece Super Admin kategori ekleyebilir.');
                } else {
                    showError(data.message || 'İşlem başarısız');
                }
            }
        } catch (err) {
            console.error('Kategori kaydetme hatası:', err);
            showError('Bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (categoryId: number) => {
        if (!confirm('Bu kategoriyi pasifleştirmek istediğinize emin misiniz?')) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/admin/categories/${categoryId}/deactivate`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showSuccess('Kategori pasifleştirildi!');
                loadCategories();
            } else {
                if (res.status === 403) {
                    showError('Bu işlem için yetkiniz yok.');
                } else {
                    showError('İşlem başarısız');
                }
            }
        } catch (err) {
            console.error('Silme hatası:', err);
            showError('Bir hata oluştu');
        }
    };

    const openNewModal = () => {
        if (userRole !== 'SUPER_ADMIN') {
            showError('Sadece Super Admin yeni kategori ekleyebilir.');
            return;
        }
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '' });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Header Skeleton */}
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton width="60px" height="24px" />
                            <Skeleton width="200px" height="32px" />
                        </div>
                        <Skeleton width="130px" height="40px" variant="rectangular" />
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <Skeleton width="100px" height="16px" className="mb-2" />
                                <Skeleton width="50px" height="32px" />
                            </div>
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                {[...Array(4)].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left">
                                        <Skeleton width="70px" height="16px" />
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <Skeleton width="120px" height="20px" className="mb-1" />
                                        <Skeleton width="180px" height="16px" />
                                    </td>
                                    <td className="px-6 py-4"><Skeleton width="100px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="60px" height="24px" variant="rectangular" /></td>
                                    <td className="px-6 py-4"><Skeleton width="120px" height="20px" /></td>
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
                        <h1 className="text-2xl font-bold">📁 Kategori Yönetimi</h1>
                    </div>
                    {userRole === 'SUPER_ADMIN' && (
                        <button
                            onClick={openNewModal}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            + Yeni Kategori
                        </button>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {userRole !== 'SUPER_ADMIN' && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>Kategori ekleme/düzenleme sadece Super Admin tarafından yapılabilir.</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Toplam Kategori</p>
                        <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Aktif Kategori</p>
                        <p className="text-2xl font-bold text-green-600">{categories.filter(c => c.active).length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            {userRole === 'SUPER_ADMIN' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            )}
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={userRole === 'SUPER_ADMIN' ? 4 : 3} className="px-6 py-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">📁</div>
                                    Henüz kategori bulunmuyor
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            {category.description && (
                                                <p className="text-gray-500 text-sm">{category.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.active ? 'Aktif' : 'Pasif'}
                      </span>
                                    </td>
                                    {userRole === 'SUPER_ADMIN' && (
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="text-red-600 hover:underline text-sm"
                                                >
                                                    Pasifleştir
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Kategori Adı *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    placeholder="Otomatik oluşturulur"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <ButtonSpinner />
                                            <span>Kaydediliyor...</span>
                                        </>
                                    ) : (
                                        editingCategory ? 'Güncelle' : 'Ekle'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}