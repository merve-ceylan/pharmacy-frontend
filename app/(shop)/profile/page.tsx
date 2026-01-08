'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const { showSuccess, showError } = useToast();

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setProfileData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                });
            } else {
                router.push('/login');
            }
        } catch (err) {
            console.error('Profil yüklenemedi', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        showSuccess('');

        const token = localStorage.getItem('accessToken');

        try {
            const res = await fetch('http://localhost:8080/api/customer/profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (res.ok) {
                const updatedUser = { ...user, ...profileData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser as User);
                showSuccess('Profil güncellendi');
            } else {
                showSuccess('Güncelleme başarısız');
            }
        } catch (err) {
            console.error('Profil güncelleme hatası', err);
            showSuccess('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showSuccess('Yeni şifreler eşleşmiyor');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showSuccess('Şifre en az 8 karakter olmalı');
            return;
        }

        setSaving(true);
        showSuccess('');

        const token = localStorage.getItem('accessToken');

        try {
            const res = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                    confirmPassword: passwordData.confirmPassword,
                }),
            });

            if (res.ok) {
                showSuccess('Şifre değiştirildi');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const data = await res.json();
                showSuccess(data.message || 'Şifre değiştirilemedi');
            }
        } catch (err) {
            console.error('Şifre değiştirme hatası', err);
            showSuccess('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8">Hesabım</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <aside className="md:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <div className="text-center mb-4">
                                    <Skeleton variant="circular" width="80px" height="80px" className="mx-auto mb-2" />
                                    <Skeleton width="120px" height="20px" className="mx-auto mb-1" />
                                    <Skeleton width="150px" height="16px" className="mx-auto" />
                                </div>
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, i) => (
                                        <Skeleton key={i} height="40px" variant="rectangular" />
                                    ))}
                                </div>
                            </div>
                        </aside>
                        <main className="md:col-span-3">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <Skeleton width="200px" height="28px" className="mb-6" />
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Skeleton height="60px" variant="rectangular" />
                                        <Skeleton height="60px" variant="rectangular" />
                                    </div>
                                    <Skeleton height="60px" variant="rectangular" />
                                    <Skeleton height="60px" variant="rectangular" />
                                    <Skeleton width="100px" height="40px" variant="rectangular" />
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
                                    👤
                                </div>
                                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                            </div>
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-2 rounded-lg ${
                                        activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    Profil Bilgileri
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`w-full text-left px-4 py-2 rounded-lg ${
                                        activeTab === 'password' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    Şifre Değiştir
                                </button>
                                <Link
                                    href="/orders"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Siparişlerim
                                </Link>
                                <Link
                                    href="/profile/addresses"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Adreslerim
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="md:col-span-3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {message && (
                                <div
                                    className={`p-4 rounded-lg mb-4 ${
                                        message.includes('güncellendi') || message.includes('değiştirildi')
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {message}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Profil Bilgileri</h2>
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-gray-700 mb-2">Ad</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={profileData.firstName}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">Soyad</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={profileData.lastName}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">E-posta</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-gray-700 mb-2">Telefon</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                        >
                                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                                        </button>
                                    </form>
                                </>
                            )}

                            {activeTab === 'password' && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Şifre Değiştir</h2>
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">Yeni Şifre</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-gray-700 mb-2">Yeni Şifre (Tekrar)</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                        >
                                            {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}