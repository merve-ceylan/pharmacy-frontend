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
    role: string;
}

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { showError } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState({
        todayOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        todayRevenue: 0,
        totalPharmacies: 0,
        totalUsers: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (!['SUPER_ADMIN', 'PHARMACY_OWNER', 'STAFF'].includes(parsedUser.role)) {
            router.push('/');
            return;
        }

        setUser(parsedUser);
        loadDashboardData(parsedUser.role, token);
    }, [router]);

    const loadDashboardData = async (role: string, token: string) => {
        try {
            if (role === 'SUPER_ADMIN') {
                setStats(prev => ({
                    ...prev,
                    totalPharmacies: 15,
                    totalUsers: 250,
                    todayOrders: 45,
                    todayRevenue: 12500,
                }));
            } else {
                try {
                    const statsRes = await fetch('http://localhost:8080/api/staff/orders/stats', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (statsRes.ok) {
                        const statsData = await statsRes.json();
                        setStats(prev => ({
                            ...prev,
                            todayOrders: statsData.todayOrders || 0,
                            pendingOrders: statsData.pending || 0,
                            totalProducts: 148,
                            todayRevenue: 2450,
                        }));
                    }
                } catch (err) {
                    console.error('Stats fetch error:', err);
                    showError('İstatistikler yüklenemedi');
                }

                try {
                    const ordersRes = await fetch('http://localhost:8080/api/staff/orders/recent', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (ordersRes.ok) {
                        const ordersData = await ordersRes.json();
                        setRecentOrders(ordersData || []);
                    }
                } catch (err) {
                    console.error('Orders fetch error:', err);
                    showError('Siparişler yüklenemedi');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PREPARING: 'bg-purple-100 text-purple-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            PENDING: 'Bekliyor',
            CONFIRMED: 'Onaylandı',
            PREPARING: 'Hazırlanıyor',
            SHIPPED: 'Kargoda',
            DELIVERED: 'Teslim Edildi',
            CANCELLED: 'İptal',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Header Skeleton */}
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div>
                            <Skeleton width="250px" height="32px" className="mb-2" />
                            <Skeleton width="150px" height="20px" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton width="120px" height="20px" />
                            <Skeleton width="80px" height="36px" variant="rectangular" />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Skeleton width="100px" height="16px" className="mb-2" />
                                        <Skeleton width="80px" height="28px" />
                                    </div>
                                    <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions Skeleton */}
                    <Skeleton width="150px" height="24px" className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
                                <Skeleton variant="circular" width="48px" height="48px" />
                                <div>
                                    <Skeleton width="120px" height="20px" className="mb-2" />
                                    <Skeleton width="150px" height="16px" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b">
                            <Skeleton width="150px" height="24px" />
                        </div>
                        <div className="p-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                    <Skeleton width="100px" height="20px" />
                                    <Skeleton width="120px" height="20px" />
                                    <Skeleton width="80px" height="20px" />
                                    <Skeleton width="80px" height="24px" variant="rectangular" />
                                    <Skeleton width="60px" height="20px" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isPharmacyOwner = user?.role === 'PHARMACY_OWNER';

    const superAdminStats = [
        { title: 'Toplam Eczane', value: stats.totalPharmacies, icon: '🏥', color: 'bg-blue-500' },
        { title: 'Toplam Kullanıcı', value: stats.totalUsers, icon: '👥', color: 'bg-green-500' },
        { title: 'Bugünkü Sipariş', value: stats.todayOrders, icon: '📦', color: 'bg-yellow-500' },
        { title: 'Bugünkü Gelir', value: `${stats.todayRevenue} TL`, icon: '💰', color: 'bg-purple-500' },
    ];

    const pharmacyStats = [
        { title: 'Bugünkü Siparişler', value: stats.todayOrders, icon: '📦', color: 'bg-blue-500' },
        { title: 'Bekleyen Siparişler', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-500' },
        { title: 'Toplam Ürün', value: stats.totalProducts, icon: '💊', color: 'bg-green-500' },
        { title: 'Bugünkü Gelir', value: `${stats.todayRevenue} TL`, icon: '💰', color: 'bg-purple-500' },
    ];

    const statCards = isSuperAdmin ? superAdminStats : pharmacyStats;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isSuperAdmin ? '🌐 Platform Yönetimi' : '🏥 Eczane Yönetim Paneli'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isSuperAdmin ? 'Super Admin Paneli' : user?.firstName + ' - ' + (isPharmacyOwner ? 'Eczane Sahibi' : 'Personel')}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">👤 {user?.firstName} {user?.lastName}</span>
                        <Link href="/" className="text-blue-600 hover:underline text-sm">Siteye Git</Link>
                        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {isSuperAdmin ? (
                        <>
                            <Link href="/dashboard/pharmacies" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">🏥</span>
                                <div>
                                    <h3 className="font-semibold">Eczane Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Eczaneleri görüntüle ve yönet</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">👥</span>
                                <div>
                                    <h3 className="font-semibold">Kullanıcı Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Tüm kullanıcıları yönet</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/subscriptions" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">💳</span>
                                <div>
                                    <h3 className="font-semibold">Abonelik Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Abonelikleri görüntüle</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/categories" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">📁</span>
                                <div>
                                    <h3 className="font-semibold">Kategori Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Kategorileri yönet</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/reports" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">📊</span>
                                <div>
                                    <h3 className="font-semibold">Platform Raporları</h3>
                                    <p className="text-gray-500 text-sm">Genel istatistikler</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/settings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">⚙️</span>
                                <div>
                                    <h3 className="font-semibold">Platform Ayarları</h3>
                                    <p className="text-gray-500 text-sm">Genel ayarlar</p>
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard/products" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">📦</span>
                                <div>
                                    <h3 className="font-semibold">Ürün Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Ürün ekle, düzenle, sil</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">🛒</span>
                                <div>
                                    <h3 className="font-semibold">Sipariş Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Siparişleri görüntüle ve yönet</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/categories" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">📁</span>
                                <div>
                                    <h3 className="font-semibold">Kategori Yönetimi</h3>
                                    <p className="text-gray-500 text-sm">Kategori ekle ve düzenle</p>
                                </div>
                            </Link>
                            {isPharmacyOwner && (
                                <>
                                    <Link href="/dashboard/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                        <span className="text-3xl">👥</span>
                                        <div>
                                            <h3 className="font-semibold">Personel Yönetimi</h3>
                                            <p className="text-gray-500 text-sm">Personel ekle ve yönet</p>
                                        </div>
                                    </Link>
                                    <Link href="/dashboard/reports" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                        <span className="text-3xl">📊</span>
                                        <div>
                                            <h3 className="font-semibold">Raporlar</h3>
                                            <p className="text-gray-500 text-sm">Satış ve performans raporları</p>
                                        </div>
                                    </Link>
                                </>
                            )}
                            <Link href="/dashboard/settings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center gap-4">
                                <span className="text-3xl">⚙️</span>
                                <div>
                                    <h3 className="font-semibold">Eczane Ayarları</h3>
                                    <p className="text-gray-500 text-sm">Eczane bilgileri</p>
                                </div>
                            </Link>
                        </>
                    )}
                </div>

                {!isSuperAdmin && (
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Son Siparişler</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Henüz sipariş bulunmuyor
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                                            <td className="px-6 py-4">{order.customerName}</td>
                                            <td className="px-6 py-4">{order.totalAmount?.toFixed(2)} TL</td>
                                            <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                            <td className="px-6 py-4">
                                                <Link href={`/dashboard/orders/${order.orderNumber}`} className="text-blue-600 hover:underline">
                                                    Detay
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}