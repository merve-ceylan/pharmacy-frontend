'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Pharmacy {
    id: number;
    name: string;
    ownerName: string;
    email: string;
    city: string;
    isActive: boolean;
    subscriptionPlan: string;
}

const initialPharmacies: Pharmacy[] = [
    { id: 1, name: 'Merkez Eczanesi', ownerName: 'Ahmet Yılmaz', email: 'merkez@eczane.com', city: 'İstanbul', isActive: true, subscriptionPlan: 'Premium' },
    { id: 2, name: 'Sağlık Eczanesi', ownerName: 'Mehmet Demir', email: 'saglik@eczane.com', city: 'Ankara', isActive: true, subscriptionPlan: 'Basic' },
    { id: 3, name: 'Güneş Eczanesi', ownerName: 'Ayşe Kaya', email: 'gunes@eczane.com', city: 'İzmir', isActive: false, subscriptionPlan: 'Premium' },
];

export default function PharmaciesPage() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>(initialPharmacies);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleStatus = (id: number) => {
        setPharmacies(prev => prev.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
        ));
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = pharmacies.filter(p => p.isActive).length;
    const inactiveCount = pharmacies.filter(p => !p.isActive).length;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Geri</Link>
                        <h1 className="text-2xl font-bold">🏥 Eczane Yönetimi</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Eczane ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-96"
                    />
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">+ Yeni Eczane</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Toplam Eczane</p>
                        <p className="text-2xl font-bold">{pharmacies.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Aktif</p>
                        <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-500 text-sm">Pasif</p>
                        <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eczane</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sahip</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şehir</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonelik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredPharmacies.map((pharmacy) => (
                            <tr key={pharmacy.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-medium">{pharmacy.name}</p>
                                    <p className="text-sm text-gray-500">{pharmacy.email}</p>
                                </td>
                                <td className="px-6 py-4">{pharmacy.ownerName}</td>
                                <td className="px-6 py-4">{pharmacy.city}</td>
                                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pharmacy.subscriptionPlan === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pharmacy.subscriptionPlan}
                    </span>
                                </td>
                                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pharmacy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pharmacy.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:underline text-sm mr-2">Düzenle</button>
                                    <button
                                        onClick={() => toggleStatus(pharmacy.id)}
                                        className={`text-sm ${pharmacy.isActive ? 'text-red-600' : 'text-green-600'} hover:underline`}
                                    >
                                        {pharmacy.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                                    </button>
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