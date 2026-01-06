'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ReportData {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalProducts: number;
    totalCustomers: number;
    ordersByStatus: Record<string, number>;
    revenueByDay: { date: string; revenue: number }[];
    topProducts: { name: string; quantity: number; revenue: number }[];
}

export default function ReportsPage() {
    const router = useRouter();
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('week');

    useEffect(() => {
        checkAuth();
        loadReports();
    }, [dateRange]);

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

    const loadReports = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/admin/reports?range=${dateRange}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const responseData = await res.json();
                setData(responseData);
            } else {
                // Mock data if API doesn't exist yet
                setData({
                    totalOrders: 156,
                    totalRevenue: 45680.50,
                    averageOrderValue: 292.82,
                    totalProducts: 248,
                    totalCustomers: 89,
                    ordersByStatus: {
                        PENDING: 12,
                        CONFIRMED: 8,
                        PREPARING: 5,
                        SHIPPED: 15,
                        DELIVERED: 110,
                        CANCELLED: 6,
                    },
                    revenueByDay: [
                        { date: '2024-01-01', revenue: 5200 },
                        { date: '2024-01-02', revenue: 4800 },
                        { date: '2024-01-03', revenue: 6100 },
                        { date: '2024-01-04', revenue: 5500 },
                        { date: '2024-01-05', revenue: 7200 },
                        { date: '2024-01-06', revenue: 8100 },
                        { date: '2024-01-07', revenue: 8780 },
                    ],
                    topProducts: [
                        { name: 'Parol 500mg', quantity: 145, revenue: 4350 },
                        { name: 'Supradyn', quantity: 98, revenue: 7840 },
                        { name: 'Centrum', quantity: 76, revenue: 6840 },
                        { name: 'Majezik', quantity: 65, revenue: 1950 },
                        { name: 'Nurofen', quantity: 54, revenue: 2160 },
                    ],
                });
            }
        } catch (err) {
            console.error('Raporlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">Rapor verileri yüklenemedi</div>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.revenue));

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <a href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Geri
                        </a>
                        <h1 className="text-2xl font-bold">📊 Raporlar</h1>
                    </div>
                    <div className="flex gap-2">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm ${
                                    dateRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {range === 'week' ? 'Haftalık' : range === 'month' ? 'Aylık' : 'Yıllık'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Toplam Sipariş</p>
                        <p className="text-3xl font-bold">{data.totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Toplam Gelir</p>
                        <p className="text-3xl font-bold text-green-600">
                            {data.totalRevenue.toLocaleString('tr-TR')} TL
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Ortalama Sipariş</p>
                        <p className="text-3xl font-bold">{data.averageOrderValue.toFixed(2)} TL</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Toplam Ürün</p>
                        <p className="text-3xl font-bold">{data.totalProducts}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Toplam Müşteri</p>
                        <p className="text-3xl font-bold">{data.totalCustomers}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">Günlük Gelir</h2>
                        <div className="space-y-3">
                            {data.revenueByDay.map((day, index) => (
                                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm w-20">
                    {new Date(day.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                    })}
                  </span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full rounded-full"
                                            style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-24 text-right">
                    {day.revenue.toLocaleString('tr-TR')} TL
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">Sipariş Durumları</h2>
                        <div className="space-y-3">
                            {Object.entries(data.ordersByStatus).map(([status, count]) => {
                                const labels: Record<string, string> = {
                                    PENDING: 'Bekleyen',
                                    CONFIRMED: 'Onaylanan',
                                    PREPARING: 'Hazırlanan',
                                    SHIPPED: 'Kargoda',
                                    DELIVERED: 'Teslim Edilen',
                                    CANCELLED: 'İptal Edilen',
                                };
                                const colors: Record<string, string> = {
                                    PENDING: 'bg-yellow-500',
                                    CONFIRMED: 'bg-blue-500',
                                    PREPARING: 'bg-purple-500',
                                    SHIPPED: 'bg-indigo-500',
                                    DELIVERED: 'bg-green-500',
                                    CANCELLED: 'bg-red-500',
                                };
                                const total = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0);
                                const percentage = ((count / total) * 100).toFixed(1);

                                return (
                                    <div key={status} className="flex items-center gap-4">
                                        <span className="text-gray-600 text-sm w-28">{labels[status]}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className={`${colors[status]} h-full rounded-full`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-16 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4">En Çok Satan Ürünler</h2>
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-gray-500 font-medium">Ürün</th>
                                <th className="text-right py-2 text-gray-500 font-medium">Satış Adedi</th>
                                <th className="text-right py-2 text-gray-500 font-medium">Gelir</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.topProducts.map((product, index) => (
                                <tr key={index} className="border-b last:border-0">
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400">{index + 1}.</span>
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right">{product.quantity}</td>
                                    <td className="py-3 text-right font-medium text-green-600">
                                        {product.revenue.toLocaleString('tr-TR')} TL
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}