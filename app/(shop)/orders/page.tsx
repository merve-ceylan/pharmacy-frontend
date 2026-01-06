'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await ordersApi.getMyOrders();
            setOrders(response.content || response.data?.content || []);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Siparişler yüklenemedi';
            setError(errorMessage);
        } finally {
            setLoading(false);
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
            CANCELLED: 'İptal Edildi',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
        );
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
                <h1 className="text-3xl font-bold mb-8">Siparişlerim</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500 text-lg">Henüz siparişiniz bulunmuyor</p>
                        <Link
                            href="/products"
                            className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                            Alışverişe Başla
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.orderNumber}`}
                                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div>
                                        <p className="font-semibold text-lg">{order.orderNumber}</p>
                                        <p className="text-gray-500 text-sm">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-gray-600">{order.itemCount} ürün</p>
                                        {order.trackingNumber && (
                                            <p className="text-sm text-gray-500">
                                                Takip No: {order.trackingNumber}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-600">
                                            {order.totalAmount.toFixed(2)} TL
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}