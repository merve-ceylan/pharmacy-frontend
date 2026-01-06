'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

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
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://localhost:8080/api/staff/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.content || []);
            }
        } catch (err) {
            console.error('Siparişler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderNumber: string, newStatus: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/staff/orders/${orderNumber}/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                loadOrders();
            } else {
                alert('Durum güncellenemedi');
            }
        } catch (err) {
            alert('Hata oluştu');
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
                        <h1 className="text-2xl font-bold">🛒 Sipariş Yönetimi</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm ${
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
                                    Sipariş bulunmuyor
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
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
                                                    className="text-green-600 hover:underline text-sm"
                                                >
                                                    {getNextStatus(order.status) === 'CONFIRMED' && 'Onayla'}
                                                    {getNextStatus(order.status) === 'PREPARING' && 'Hazırla'}
                                                    {getNextStatus(order.status) === 'SHIPPED' && 'Kargola'}
                                                    {getNextStatus(order.status) === 'DELIVERED' && 'Teslim Et'}
                                                </button>
                                            )}
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => updateStatus(order.orderNumber, 'CANCELLED')}
                                                    className="text-red-600 hover:underline text-sm"
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