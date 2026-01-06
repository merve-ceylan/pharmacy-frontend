'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'Eczanem',
        siteDescription: 'Online Eczane Platformu',
        supportEmail: 'destek@eczanem.com',
        supportPhone: '0850 123 45 67',
        commissionRate: 10,
        minOrderAmount: 50,
        freeShippingLimit: 200,
        maintenanceMode: false,
    });
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call would go here
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Geri</Link>
                        <h1 className="text-2xl font-bold">⚙️ Platform Ayarları</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {saved && (
                    <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                        ✅ Ayarlar başarıyla kaydedildi!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Genel Ayarlar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Site Adı</label>
                                <input
                                    type="text"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Site Açıklaması</label>
                                <input
                                    type="text"
                                    name="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">İletişim Bilgileri</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Destek E-posta</label>
                                <input
                                    type="email"
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Destek Telefon</label>
                                <input
                                    type="text"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">İş Ayarları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Komisyon Oranı (%)</label>
                                <input
                                    type="number"
                                    name="commissionRate"
                                    value={settings.commissionRate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Minimum Sipariş (TL)</label>
                                <input
                                    type="number"
                                    name="minOrderAmount"
                                    value={settings.minOrderAmount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Ücretsiz Kargo Limiti (TL)</label>
                                <input
                                    type="number"
                                    name="freeShippingLimit"
                                    value={settings.freeShippingLimit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Sistem Ayarları</h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label className="text-gray-700">Bakım Modu (Site geçici olarak kapatılır)</label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Ayarları Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}