'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    active: boolean;
}

export default function AdminCategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

        // SUPER_ADMIN, PHARMACY_OWNER, STAFF kategorileri görebilir
        if (!['SUPER_ADMIN', 'PHARMACY_OWNER', 'STAFF'].includes(user.role)) {
            router.push('/');
            return;
        }
        loadCategories(user.role);
    }, [router]);

    const loadCategories = async (role: string) => {
        try {
            // Public endpoint kullan - herkes görebilir
            const res = await fetch('http://localhost:8080/api/public/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (err) {
            console.error('Kategoriler yüklenemedi:', err);
            setError('Kategoriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('accessToken');

        // Slug oluştur
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
                setSuccess(editingCategory ? 'Kategori güncellendi!' : 'Kategori eklendi!');
                setTimeout(() => setSuccess(''), 3000);
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', slug: '', description: '' });
                loadCategories(userRole);
            } else {
                const data = await res.json().catch(() => ({}));
                if (res.status === 403) {
                    setError('Bu işlem için yetkiniz yok. Sadece Super Admin kategori ekleyebilir.');
                } else {
                    setError(data.message || 'İşlem başarısız');
                }
            }
        } catch (err) {
            console.error('Kategori kaydetme hatası:', err);
            setError('Bir hata oluştu');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
        setError('');
        setShowModal(true);
    };

    const handleDelete = async (categoryId: number) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/admin/categories/${categoryId}/deactivate`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccess('Kategori pasifleştirildi!');
                setTimeout(() => setSuccess(''), 3000);
                loadCategories(userRole);
            } else {
                if (res.status === 403) {
                    setError('Bu işlem için yetkiniz yok.');
                } else {
                    setError('İşlem başarısız');
                }
            }
        } catch (err) {
            console.error('Silme hatası:', err);
            setError('Bir hata oluştu');
        }
    };

    const openNewModal = () => {
        if (userRole !== 'SUPER_ADMIN') {
            setError('Sadece Super Admin yeni kategori ekleyebilir.');
            return;
        }
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '' });
        setError('');
        setShowModal(true);
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
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            + Yeni Kategori
                        </button>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">{success}</div>
                )}

                {userRole !== 'SUPER_ADMIN' && (
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
                        ℹ️ Kategori ekleme/düzenleme sadece Super Admin tarafından yapılabilir.
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Toplam Kategori</p>
                        <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
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
                                    Henüz kategori bulunmuyor
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                        </h2>
                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Kategori Adı *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Otomatik oluşturulur"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                >
                                    {editingCategory ? 'Güncelle' : 'Ekle'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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