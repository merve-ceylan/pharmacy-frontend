'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersApi } from '@/lib/api';

interface OrderDetail {
    id: number;
    orderNumber: string;
    status: string;
    shippingAddress: string;
    shippingCity: string;
    shippingDistrict: string;
    shippingPostalCode: string;
    shippingPhone: string;
    deliveryType: string;
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    notes?: string;
    trackingNumber?: string;
    cargoCompany?: string;
    pharmacyName: string;
    items: {
        id: number;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    createdAt: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancellable: boolean;
}

export default function CustomerOrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderNumber = params.orderNumber as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [orderNumber]);

    const loadOrder = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await ordersApi.getByOrderNumber(orderNumber);
            setOrder(response.data || response);
        } catch (err) {
            console.error('Sipariş yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return;

        const token = localStorage.getItem('accessToken');
        setCancelling(true);
        try {
            const res = await fetch(`http://localhost:8080/api/customer/orders/${orderNumber}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                loadOrder();
            } else {
                alert('Sipariş iptal edilemedi');
            }
        } catch (err) {
            alert('Bir hata oluştu');
        } finally {
            setCancelling(false);
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

    const getStatusStep = (status: string) => {
        const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'];
        return steps.indexOf(status);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">Sipariş bulunamadı</p>
                    <a href="/orders" className="text-blue-600 hover:underline">
                        Siparişlerime Dön
                    </a>
                </div>
            </div>
        );
    }

    const currentStep = getStatusStep(order.status);

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <a href="/orders" className="text-gray-500 hover:text-gray-700">
                            ← Siparişlerim
                        </a>
                        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
                        {getStatusBadge(order.status)}
                    </div>
                    {order.cancellable && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                        >
                            {cancelling ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                {order.status !== 'CANCELLED' && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between">
                            {['Bekliyor', 'Onaylandı', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi'].map(
                                (step, index) => (
                                    <div key={step} className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                index <= currentStep
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <p
                                            className={`mt-2 text-sm ${
                                                index <= currentStep ? 'text-green-600 font-medium' : 'text-gray-500'
                                            }`}
                                        >
                                            {step}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ürünler */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Sipariş Detayı</h2>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-3 border-b last:border-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                                                💊
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {item.quantity} x {item.unitPrice.toFixed(2)} TL
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-medium">{item.totalPrice.toFixed(2)} TL</p>
                                    </div>
                                ))}
                            </div>

                            {/* Toplam */}
                            <div className="border-t mt-4 pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ara Toplam</span>
                                    <span>{order.subtotal.toFixed(2)} TL</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Kargo</span>
                                    <span>{order.shippingCost.toFixed(2)} TL</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Toplam</span>
                                    <span className="text-green-600">{order.totalAmount.toFixed(2)} TL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Panel */}
                    <div className="space-y-6">
                        {/* Teslimat Bilgileri */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Teslimat Adresi</h2>
                            <p className="text-gray-600">{order.shippingAddress}</p>
                            <p className="text-gray-600">
                                {order.shippingDistrict}/{order.shippingCity}
                            </p>
                            <p className="text-gray-600">{order.shippingPostalCode}</p>
                            <p className="text-gray-600 mt-2">📞 {order.shippingPhone}</p>
                        </div>

                        {/* Kargo Takip */}
                        {order.trackingNumber && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-bold mb-4">Kargo Bilgisi</h2>
                                <p className="text-gray-600">
                                    <span className="font-medium">Firma:</span> {order.cargoCompany}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Takip No:</span> {order.trackingNumber}
                                </p>
                            </div>
                        )}

                        {/* Eczane Bilgisi */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Satıcı</h2>
                            <p className="font-medium">{order.pharmacyName}</p>
                        </div>

                        {/* Tarih */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Sipariş Tarihi</h2>
                            <p className="text-gray-600">
                                {new Date(order.createdAt).toLocaleString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}