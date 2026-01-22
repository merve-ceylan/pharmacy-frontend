'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import { usersApi } from '@/lib/api';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    active: boolean;
    emailVerified: boolean;
    pharmacyId: number | null;
    pharmacyName: string | null;
    createdAt: string;
    lastLogin: string | null;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [togglingId, setTogglingId] = useState<number | null>(null);

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
        try {
            setLoading(true);
            const roleFilter = filter !== 'ALL' ? filter : undefined;
            const data = await usersApi.getAll(roleFilter);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load users:', err);
            showError('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            loadUsers();
        }
    }, [filter]);

    const toggleActive = async (userId: number, currentActive: boolean) => {
        setTogglingId(userId);
        try {
            if (currentActive) {
                await usersApi.deactivate(userId);
                showSuccess('Kullanıcı pasifleştirildi');
            } else {
                await usersApi.activate(userId);
                showSuccess('Kullanıcı aktifleştirildi');
            }
            loadUsers();
        } catch (err) {
            console.error('Toggle error:', err);
            showError('İşlem başarısız');
        } finally {
            setTogglingId(null);
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
        const matchesSearch =
            searchQuery === '' ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
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
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <Skeleton width="100%" height="40px" variant="rectangular" className="flex-1" />
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} width="80px" height="40px" variant="rectangular" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                {[...Array(6)].map((_, i) => (
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
                                        <Skeleton width="150px" height="16px" />
                                    </td>
                                    <td className="px-6 py-4"><Skeleton width="80px" height="24px" variant="rectangular" /></td>
                                    <td className="px-6 py-4"><Skeleton width="100px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="60px" height="24px" variant="rectangular" /></td>
                                    <td className="px-6 py-4"><Skeleton width="80px" height="20px" /></td>
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
                        <h1 className="text-2xl font-bold">👥 Kullanıcı Yönetimi</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        Toplam: {users.length} kullanıcı
                    </div>
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
                            {['ALL', 'SUPER_ADMIN', 'PHARMACY_OWNER', 'STAFF', 'CUSTOMER'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilter(role)}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${
                                        filter === role
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {role === 'ALL' ? 'Tümü' :
                                        role === 'SUPER_ADMIN' ? 'Adminler' :
                                            role === 'PHARMACY_OWNER' ? 'Site Sahipleri' :
                                                role === 'STAFF' ? 'Personeller' : 'Müşteriler'}
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
                                Eczane
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
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">👥</div>
                                    Kullanıcı bulunamadı
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-gray-500 text-sm">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">
                                        {user.pharmacyName ? (
                                            <span className="text-sm text-gray-600">{user.pharmacyName}</span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{user.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {user.active ? 'Aktif' : 'Pasif'}
                                                </span>
                                            {user.emailVerified && (
                                                <span className="text-green-600 text-sm" title="E-posta doğrulanmış">✓</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleActive(user.id, user.active)}
                                                disabled={togglingId === user.id}
                                                className={`text-sm disabled:opacity-50 ${
                                                    user.active
                                                        ? 'text-red-600 hover:underline'
                                                        : 'text-green-600 hover:underline'
                                                }`}
                                            >
                                                {togglingId === user.id ? '...' : user.active ? 'Pasif Yap' : 'Aktif Yap'}
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