'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';

interface Pharmacy {
    id: number;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    isActive: boolean;
    subscriptionPlan: string;
}

const initialPharmacies: Pharmacy[] = [
    { id: 1, name: 'Merkez Eczanesi', ownerName: 'Ahmet Yılmaz', email: 'merkez@eczane.com', phone: '0532 111 22 33', city: 'İstanbul', address: 'Kadıköy Merkez Mah.', isActive: true, subscriptionPlan: 'Premium' },
    { id: 2, name: 'Sağlık Eczanesi', ownerName: 'Mehmet Demir', email: 'saglik@eczane.com', phone: '0533 222 33 44', city: 'Ankara', address: 'Çankaya Cad. No:15', isActive: true, subscriptionPlan: 'Basic' },
    { id: 3, name: 'Güneş Eczanesi', ownerName: 'Ayşe Kaya', email: 'gunes@eczane.com', phone: '0534 333 44 55', city: 'İzmir', address: 'Karşıyaka Sok. No:8', isActive: false, subscriptionPlan: 'Premium' },
];

export default function PharmaciesPage() {
    const { showSuccess, showError } = useToast();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        subscriptionPlan: 'Basic',
    });

    useEffect(() => {
        setTimeout(() => {
            setPharmacies(initialPharmacies);
            setLoading(false);
        }, 500);
    }, []);

    const toggleStatus = (id: number) => {
        const pharmacy = pharmacies.find(p => p.id === id);
        setPharmacies(prev => prev.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
        ));
        showSuccess(pharmacy?.isActive ? 'Eczane pasifleştirildi' : 'Eczane aktifleştirildi');
    };

    const openNewModal = () => {
        setEditingPharmacy(null);
        setFormData({
            name: '',
            ownerName: '',
            email: '',
            phone: '',
            city: '',
            address: '',
            subscriptionPlan: 'Basic',
        });
        setShowModal(true);
    };

    const openEditModal = (pharmacy: Pharmacy) => {
        setEditingPharmacy(pharmacy);
        setFormData({
            name: pharmacy.name,
            ownerName: pharmacy.ownerName,
            email: pharmacy.email,
            phone: pharmacy.phone || '',
            city: pharmacy.city,
            address: pharmacy.address || '',
            subscriptionPlan: pharmacy.subscriptionPlan,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingPharmacy) {
                setPharmacies(prev => prev.map(p =>
                    p.id === editingPharmacy.id
                        ? { ...p, ...formData }
                        : p
                ));
                showSuccess('Eczane güncellendi');
            } else {
                const newPharmacy: Pharmacy = {
                    id: Math.max(...pharmacies.map(p => p.id)) + 1,
                    ...formData,
                    isActive: true,
                };
                setPharmacies(prev => [...prev, newPharmacy]);
                showSuccess('Eczane eklendi');
            }
            setShowModal(false);
        } catch (err) {
            showError('İşlem başarısız');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Bu eczaneyi silmek istediğinize emin misiniz?')) return;
        setPharmacies(prev => prev.filter(p => p.id !== id));
        showSuccess('Eczane silindi');
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = pharmacies.filter(p => p.isActive).length;
    const inactiveCount = pharmacies.filter(p => !p.isActive).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton width="60px" height="24px" />
                            <Skeleton width="200px" height="32px" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between mb-6">
                        <Skeleton width="300px" height="40px" variant="rectangular" />
                        <Skeleton width="130px" height="40px" variant="rectangular" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <Skeleton width="80px" height="16px" className="mb-2" />
                                <Skeleton width="50px" height="32px" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                {[...Array(6)].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left">
                                        <Skeleton width="60px" height="16px" />
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {[...Array(3)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <Skeleton width="120px" height="20px" className="mb-1" />
                                        <Skeleton width="150px" height="16px" />
                                    </td>
                                    <td className="px-6 py-4"><Skeleton width="100px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="80px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="70px" height="24px" variant="rectangular" /></td>
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
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Geri</Link>
                        <h1 className="text-2xl font-bold">🏥 Eczane Yönetimi</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Eczane ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-96"
                    />
                    <button
                        onClick={openNewModal}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Yeni Eczane
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Toplam Eczane</p>
                        <p className="text-2xl font-bold">{pharmacies.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Aktif</p>
                        <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Pasif</p>
                        <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eczane</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sahip</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şehir</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonelik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredPharmacies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">🏥</div>
                                    Eczane bulunamadı
                                </td>
                            </tr>
                        ) : (
                            filteredPharmacies.map((pharmacy) => (
                                <tr key={pharmacy.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{pharmacy.name}</p>
                                        <p className="text-sm text-gray-500">{pharmacy.email}</p>
                                    </td>
                                    <td className="px-6 py-4">{pharmacy.ownerName}</td>
                                    <td className="px-6 py-4">{pharmacy.city}</td>
                                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pharmacy.subscriptionPlan === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pharmacy.subscriptionPlan}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pharmacy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pharmacy.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => openEditModal(pharmacy)}
                                            className="text-blue-600 hover:underline text-sm mr-2"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(pharmacy.id)}
                                            className={`text-sm mr-2 ${pharmacy.isActive ? 'text-red-600' : 'text-green-600'} hover:underline`}
                                        >
                                            {pharmacy.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pharmacy.id)}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Sil
                                        </button>
                                    </td>
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
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingPharmacy ? '🏥 Eczane Düzenle' : '🏥 Yeni Eczane Ekle'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">Eczane Adı *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Sahip Adı *</label>
                                    <input
                                        type="text"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">E-posta *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Şehir *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Abonelik</label>
                                    <select
                                        value={formData.subscriptionPlan}
                                        onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                    rows={2}
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
                                        editingPharmacy ? 'Güncelle' : 'Ekle'
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