'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    active: boolean;
    emailVerified: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        checkAuth();
        loadUsers();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(userData);
        if (user.role !== 'PHARMACY_OWNER' && user.role !== 'SUPER_ADMIN') {
            router.push('/dashboard');
        }
    };

    const loadUsers = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://localhost:8080/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.content || data || []);
            }
        } catch (err) {
            console.error('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (userId: number, currentActive: boolean) => {
        const token = localStorage.getItem('accessToken');
        const endpoint = currentActive ? 'deactivate' : 'activate';

        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/${endpoint}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                loadUsers();
            }
        } catch (err) {
            alert('İşlem başarısız');
        }
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            SUPER_ADMIN: 'bg-red-100 text-red-800',
            PHARMACY_OWNER: 'bg-purple-100 text-purple-800',
            STAFF: 'bg-blue-100 text-blue-800',
            CUSTOMER: 'bg-gray-100 text-gray-800',
        };
        const labels: Record<string, string> = {
            SUPER_ADMIN: 'Süper Admin',
            PHARMACY_OWNER: 'Eczane Sahibi',
            STAFF: 'Personel',
            CUSTOMER: 'Müşteri',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role] || role}
      </span>
        );
    };

    const filteredUsers = users.filter((user) => {
        const matchesFilter = filter === 'ALL' || user.role === filter;
        const matchesSearch =
            searchQuery === '' ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                        <a href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Geri
                        </a>
                        <h1 className="text-2xl font-bold">👥 Personel Yönetimi</h1>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/users/new')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Yeni Personel
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="İsim veya e-posta ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['ALL', 'CUSTOMER', 'STAFF', 'PHARMACY_OWNER'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilter(role)}
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                        filter === role
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {role === 'ALL'
                                        ? 'Tümü'
                                        : role === 'CUSTOMER'
                                            ? 'Müşteriler'
                                            : role === 'STAFF'
                                                ? 'Personel'
                                                : 'Sahipler'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Kullanıcı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Telefon
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Kayıt Tarihi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                İşlemler
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Kullanıcı bulunamadı
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-gray-500 text-sm">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4 text-gray-500">{user.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                        <span
                            className={`px-2 py-1 rounded-full text-xs ${
                                user.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {user.active ? 'Aktif' : 'Pasif'}
                        </span>
                                            {user.emailVerified && (
                                                <span className="text-green-600 text-sm">✓ Doğrulanmış</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/users/${user.id}`)}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Detay
                                            </button>
                                            <button
                                                onClick={() => toggleActive(user.id, user.active)}
                                                className={`text-sm ${
                                                    user.active
                                                        ? 'text-red-600 hover:underline'
                                                        : 'text-green-600 hover:underline'
                                                }`}
                                            >
                                                {user.active ? 'Pasif Yap' : 'Aktif Yap'}
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