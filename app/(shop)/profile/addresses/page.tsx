'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
    id: number;
    title: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        district: '',
        postalCode: '',
        isDefault: false,
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/customer/addresses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAddresses(data || []);
            }
        } catch (err) {
            console.error('Adresler yüklenemedi', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('accessToken');

        const url = editingAddress
            ? `http://localhost:8080/api/customer/addresses/${editingAddress.id}`
            : 'http://localhost:8080/api/customer/addresses';

        const method = editingAddress ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                setEditingAddress(null);
                resetForm();
                loadAddresses();
            } else {
                const data = await res.json();
                setError(data.message || 'İşlem başarısız');
            }
        } catch (err) {
            console.error('Adres kaydetme hatası', err);
            setError('Bir hata oluştu');
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            title: address.title,
            fullName: address.fullName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            district: address.district,
            postalCode: address.postalCode || '',
            isDefault: address.isDefault,
        });
        setShowModal(true);
    };

    const handleDelete = async (addressId: number) => {
        if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/customer/addresses/${addressId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                loadAddresses();
            }
        } catch (err) {
            console.error('Silme hatası', err);
            alert('Silinemedi');
        }
    };

    const setAsDefault = async (addressId: number) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/customer/addresses/${addressId}/default`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                loadAddresses();
            }
        } catch (err) {
            console.error('Varsayılan yapma hatası', err);
            alert('İşlem başarısız');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            fullName: '',
            phone: '',
            addressLine: '',
            city: '',
            district: '',
            postalCode: '',
            isDefault: false,
        });
        setError('');
    };

    const openNewModal = () => {
        setEditingAddress(null);
        resetForm();
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
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-gray-500 hover:text-gray-700">
                            ← Hesabım
                        </Link>
                        <h1 className="text-3xl font-bold">📍 Adreslerim</h1>
                    </div>
                    <button
                        onClick={openNewModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Yeni Adres
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500 text-lg">Kayıtlı adresiniz bulunmuyor</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`bg-white rounded-lg shadow-md p-6 ${
                                    address.isDefault ? 'ring-2 ring-blue-500' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{address.title}</h3>
                                        {address.isDefault && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Varsayılan
                      </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                                <p className="font-medium">{address.fullName}</p>
                                <p className="text-gray-600">{address.addressLine}</p>
                                <p className="text-gray-600">
                                    {address.district}/{address.city} {address.postalCode}
                                </p>
                                <p className="text-gray-600">📞 {address.phone}</p>
                                {!address.isDefault && (
                                    <button
                                        onClick={() => setAsDefault(address.id)}
                                        className="mt-4 text-blue-600 hover:underline text-sm"
                                    >
                                        Varsayılan Yap
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">
                                {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                            </h2>

                            {error && (
                                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Adres Başlığı *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Örn: Ev, İş"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Ad Soyad *</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Telefon *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Adres *</label>
                                    <textarea
                                        value={formData.addressLine}
                                        onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        placeholder="Mahalle, sokak, bina no, daire no"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-700 mb-2">İl *</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">İlçe *</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Posta Kodu</label>
                                        <input
                                            type="text"
                                            value={formData.postalCode}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span>Varsayılan adres olarak ayarla</span>
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        {editingAddress ? 'Güncelle' : 'Kaydet'}
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
        </div>
    );
}