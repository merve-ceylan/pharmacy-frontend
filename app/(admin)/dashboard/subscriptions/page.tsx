'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Subscription {
    id: number;
    pharmacyName: string;
    plan: string;
    price: number;
    endDate: string;
    status: string;
    autoRenew: boolean;
}

const initialSubs: Subscription[] = [
    { id: 1, pharmacyName: 'Merkez Eczanesi', plan: 'Premium', price: 499, endDate: '2025-01-01', status: 'ACTIVE', autoRenew: true },
    { id: 2, pharmacyName: 'Sağlık Eczanesi', plan: 'Basic', price: 199, endDate: '2025-02-15', status: 'ACTIVE', autoRenew: false },
    { id: 3, pharmacyName: 'Güneş Eczanesi', plan: 'Premium', price: 499, endDate: '2024-06-01', status: 'EXPIRED', autoRenew: false },
    { id: 4, pharmacyName: 'Yıldız Eczanesi', plan: 'Basic', price: 199, endDate: '2025-03-01', status: 'ACTIVE', autoRenew: true },
];

export default function SubscriptionsPage() {
    const [subscriptions] = useState<Subscription[]>(initialSubs);
    const [filterPlan, setFilterPlan] = useState('ALL');

    const filteredSubs = subscriptions.filter(s => filterPlan === 'ALL' || s.plan === filterPlan);

    const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
    const premiumCount = subscriptions.filter(s => s.plan === 'Premium').length;
    const totalRevenue = subscriptions.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + s.price, 0);

    const getStatusBadge = (status: string) => {
        if (status === 'ACTIVE') {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>;
        }
        if (status === 'EXPIRED') {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Süresi Doldu</span>;
        }
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Geri</Link>
                        <h1 className="text-2xl font-bold">💳 Abonelik Yönetimi</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Toplam Abonelik</p>
                        <p className="text-2xl font-bold">{subscriptions.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Aktif</p>
                        <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Premium</p>
                        <p className="text-2xl font-bold text-purple-600">{premiumCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Aylık Gelir</p>
                        <p className="text-2xl font-bold text-blue-600">{totalRevenue} TL</p>
                    </div>
                </div>

                <div className="mb-6">
                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Tüm Planlar</option>
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
                        <h3 className="text-xl font-bold mb-2">📦 Basic Plan</h3>
                        <p className="text-3xl font-bold text-blue-600 mb-4">199 TL<span className="text-sm text-gray-500">/ay</span></p>
                        <ul className="space-y-2 text-gray-600">
                            <li>✅ 100 ürün limiti</li>
                            <li>✅ Temel raporlar</li>
                            <li>✅ E-posta desteği</li>
                            <li>❌ API erişimi</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-500">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">👑 Premium Plan</h3>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Önerilen</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600 mb-4">499 TL<span className="text-sm text-gray-500">/ay</span></p>
                        <ul className="space-y-2 text-gray-600">
                            <li>✅ Sınırsız ürün</li>
                            <li>✅ Gelişmiş raporlar</li>
                            <li>✅ 7/24 destek</li>
                            <li>✅ API erişimi</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eczane</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bitiş</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oto. Yenileme</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredSubs.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{sub.pharmacyName}</td>
                                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.plan === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.plan}
                    </span>
                                </td>
                                <td className="px-6 py-4">{sub.price} TL/ay</td>
                                <td className="px-6 py-4">{new Date(sub.endDate).toLocaleDateString('tr-TR')}</td>
                                <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                                <td className="px-6 py-4">
                    <span className={sub.autoRenew ? 'text-green-600' : 'text-gray-500'}>
                      {sub.autoRenew ? '✅' : '❌'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}