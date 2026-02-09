'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import { ordersApi } from '@/lib/api';

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    itemCount: number;
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        preparing: 0,
        shipped: 0,
    });

    useEffect(() => {
        checkAuth();
        loadOrders();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(userData);
        if (user.role !== 'PHARMACY_OWNER' && user.role !== 'STAFF') {
            router.push('/');
        }
    };

    const loadOrders = async () => {
        try {
            const [ordersData, statsData] = await Promise.all([
                ordersApi.staff.getAll(),
                ordersApi.staff.getStats(),
            ]);
            setOrders(ordersData.content || []);
            setStats(statsData);
        } catch (err) {
            showError('Siparişler yüklenemedi');
            console.error('Siparişler yüklenemedi', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderNumber: string, newStatus: string) => {
        setUpdatingOrder(orderNumber);
        try {
            await ordersApi.staff.updateStatus(orderNumber, newStatus);
            const statusLabels: Record<string, string> = {
                CONFIRMED: 'Sipariş onaylandı',
                PREPARING: 'Sipariş hazırlanıyor',
                SHIPPED: 'Sipariş kargoya verildi',
                DELIVERED: 'Sipariş teslim edildi',
                CANCELLED: 'Sipariş iptal edildi',
            };
            showSuccess(statusLabels[newStatus] || 'Durum güncellendi');
            loadOrders();
        } catch (err) {
            showError('Bir hata oluştu');
            console.error('Status update error:', err);
        } finally {
            setUpdatingOrder(null);
        }
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
        );
    };

    const getNextStatus = (current: string): string | null => {
        const flow: Record<string, string> = {
            PENDING: 'CONFIRMED',
            CONFIRMED: 'PREPARING',
            PREPARING: 'SHIPPED',
            SHIPPED: 'DELIVERED',
        };
        return flow[current] || null;
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Header Skeleton */}
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <Skeleton width="60px" height="24px" />
                        <Skeleton width="200px" height="32px" />
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <Skeleton width="80px" height="16px" className="mb-2" />
                                <Skeleton width="50px" height="32px" />
                            </div>
                        ))}
                    </div>

                    {/* Filters Skeleton */}
                    <div className="flex gap-2 mb-6">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} width="80px" height="40px" variant="rectangular" />
                        ))}
                    </div>

                    {/* Table Skeleton */}
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
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <Skeleton width="100px" height="20px" className="mb-1" />
                                        <Skeleton width="60px" height="16px" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton width="120px" height="20px" className="mb-1" />
                                        <Skeleton width="150px" height="16px" />
                                    </td>
                                    <td className="px-6 py-4"><Skeleton width="80px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="70px" height="24px" variant="rectangular" /></td>
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
                        <h1 className="text-2xl font-bold">🛒 Sipariş Yönetimi</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Toplam Sipariş</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Bekleyen</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Hazırlanan</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.preparing}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Kargoda</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm transition ${
                                    filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {status === 'ALL' ? 'Tümü' :
                                    status === 'PENDING' ? 'Bekleyen' :
                                        status === 'CONFIRMED' ? 'Onaylanan' :
                                            status === 'PREPARING' ? 'Hazırlanan' :
                                                status === 'SHIPPED' ? 'Kargoda' :
                                                    status === 'DELIVERED' ? 'Teslim' : 'İptal'}
                                {status !== 'ALL' && (
                                    <span className="ml-1 text-xs">
                    ({orders.filter(o => o.status === status).length})
                  </span>
                                )}
                            </button>
                        )
                    )}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Sipariş
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Müşteri
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tutar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tarih
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                İşlemler
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">📦</div>
                                    Sipariş bulunmuyor
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{order.orderNumber}</p>
                                        <p className="text-gray-500 text-sm">{order.itemCount} ürün</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{order.customerName}</p>
                                        <p className="text-gray-500 text-sm">{order.customerEmail}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {order.totalAmount.toFixed(2)} TL
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {getNextStatus(order.status) && (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(order.orderNumber, getNextStatus(order.status)!)
                                                    }
                                                    disabled={updatingOrder === order.orderNumber}
                                                    className="text-green-600 hover:underline text-sm disabled:opacity-50"
                                                >
                                                    {updatingOrder === order.orderNumber ? '...' :
                                                        getNextStatus(order.status) === 'CONFIRMED' ? 'Onayla' :
                                                            getNextStatus(order.status) === 'PREPARING' ? 'Hazırla' :
                                                                getNextStatus(order.status) === 'SHIPPED' ? 'Kargola' :
                                                                    getNextStatus(order.status) === 'DELIVERED' ? 'Teslim Et' : ''}
                                                </button>
                                            )}
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => updateStatus(order.orderNumber, 'CANCELLED')}
                                                    disabled={updatingOrder === order.orderNumber}
                                                    className="text-red-600 hover:underline text-sm disabled:opacity-50"
                                                >
                                                    İptal
                                                </button>
                                            )}
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