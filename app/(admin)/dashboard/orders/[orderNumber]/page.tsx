'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface OrderDetail {
    id: number;
    orderNumber: string;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
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
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderNumber = params.orderNumber as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [cargoCompany, setCargoCompany] = useState('');

    useEffect(() => {
        loadOrder();
    }, [orderNumber]);

    const loadOrder = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/staff/orders/${orderNumber}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data.data || data);
                setTrackingNumber(data.trackingNumber || '');
                setCargoCompany(data.cargoCompany || '');
            }
        } catch (err) {
            console.error('Sipariş yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        const token = localStorage.getItem('accessToken');
        setUpdating(true);
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
                loadOrder();
            }
        } catch (err) {
            alert('Durum güncellenemedi');
        } finally {
            setUpdating(false);
        }
    };

    const updateTracking = async () => {
        const token = localStorage.getItem('accessToken');
        setUpdating(true);
        try {
            const res = await fetch(`http://localhost:8080/api/staff/orders/${orderNumber}/tracking`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackingNumber, cargoCompany }),
            });
            if (res.ok) {
                loadOrder();
                alert('Kargo bilgisi güncellendi');
            }
        } catch (err) {
            alert('Güncellenemedi');
        } finally {
            setUpdating(false);
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

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">Sipariş bulunamadı</p>
                    <a href="/dashboard/orders" className="text-blue-600 hover:underline">
                        Siparişlere Dön
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <a href="/dashboard/orders" className="text-gray-500 hover:text-gray-700">
                            ← Geri
                        </a>
                        <h1 className="text-2xl font-bold">Sipariş: {order.orderNumber}</h1>
                        {getStatusBadge(order.status)}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol - Sipariş Bilgileri */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ürünler */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Ürünler</h2>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                💊
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-gray-500 text-sm">SKU: {item.productSku}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{item.totalPrice.toFixed(2)} TL</p>
                                            <p className="text-gray-500 text-sm">{item.quantity} x {item.unitPrice.toFixed(2)} TL</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Teslimat Bilgileri */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Teslimat Bilgileri</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">Teslimat Tipi</p>
                                    <p className="font-medium">{order.deliveryType === 'CARGO' ? 'Kargo' : 'Kurye'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Telefon</p>
                                    <p className="font-medium">{order.shippingPhone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 text-sm">Adres</p>
                                    <p className="font-medium">
                                        {order.shippingAddress}, {order.shippingDistrict}/{order.shippingCity} {order.shippingPostalCode}
                                    </p>
                                </div>
                                {order.notes && (
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-sm">Sipariş Notu</p>
                                        <p className="font-medium">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kargo Bilgileri */}
                        {(order.status === 'PREPARING' || order.status === 'SHIPPED') && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-bold mb-4">Kargo Bilgileri</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Kargo Firması</label>
                                        <input
                                            type="text"
                                            value={cargoCompany}
                                            onChange={(e) => setCargoCompany(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Örn: Yurtiçi Kargo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Takip Numarası</label>
                                        <input
                                            type="text"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Takip numarası"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={updateTracking}
                                    disabled={updating}
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {updating ? 'Kaydediliyor...' : 'Kargo Bilgisini Kaydet'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sağ - Özet ve İşlemler */}
                    <div className="space-y-6">
                        {/* Sipariş Özeti */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Sipariş Özeti</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ara Toplam</span>
                                    <span>{order.subtotal.toFixed(2)} TL</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Kargo</span>
                                    <span>{order.shippingCost.toFixed(2)} TL</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Toplam</span>
                                        <span className="text-green-600">{order.totalAmount.toFixed(2)} TL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Müşteri Bilgileri */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Müşteri</h2>
                            <div className="space-y-2">
                                <p className="font-medium">{order.customerName}</p>
                                <p className="text-gray-600">{order.customerEmail}</p>
                                <p className="text-gray-600">{order.customerPhone}</p>
                            </div>
                        </div>

                        {/* Durum İşlemleri */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">İşlemler</h2>
                            <div className="space-y-2">
                                {order.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus('CONFIRMED')}
                                            disabled={updating}
                                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                        >
                                            Siparişi Onayla
                                        </button>
                                        <button
                                            onClick={() => updateStatus('CANCELLED')}
                                            disabled={updating}
                                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                                        >
                                            İptal Et
                                        </button>
                                    </>
                                )}
                                {order.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => updateStatus('PREPARING')}
                                        disabled={updating}
                                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                                    >
                                        Hazırlanıyor
                                    </button>
                                )}
                                {order.status === 'PREPARING' && (
                                    <button
                                        onClick={() => updateStatus('SHIPPED')}
                                        disabled={updating}
                                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                                    >
                                        Kargoya Ver
                                    </button>
                                )}
                                {order.status === 'SHIPPED' && (
                                    <button
                                        onClick={() => updateStatus('DELIVERED')}
                                        disabled={updating}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        Teslim Edildi
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tarihler */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold mb-4">Tarihçe</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Oluşturuldu</span>
                                    <span>{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                                </div>
                                {order.confirmedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Onaylandı</span>
                                        <span>{new Date(order.confirmedAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                )}
                                {order.shippedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kargoya Verildi</span>
                                        <span>{new Date(order.shippedAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                )}
                                {order.deliveredAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Teslim Edildi</span>
                                        <span>{new Date(order.deliveredAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}