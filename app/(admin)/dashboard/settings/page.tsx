'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';

export default function SettingsPage() {
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // API call would go here
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('Ayarlar başarıyla kaydedildi!');
        } catch (err) {
            showError('Ayarlar kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Skeleton width="60px" height="24px" />
                            <Skeleton width="200px" height="32px" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8 space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6">
                            <Skeleton width="150px" height="28px" className="mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Skeleton width="100px" height="20px" className="mb-2" />
                                    <Skeleton width="100%" height="40px" variant="rectangular" />
                                </div>
                                <div>
                                    <Skeleton width="120px" height="20px" className="mb-2" />
                                    <Skeleton width="100%" height="40px" variant="rectangular" />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <Skeleton width="150px" height="48px" variant="rectangular" />
                    </div>
                </div>
            </div>
        );
    }

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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">🏷️ Genel Ayarlar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Site Adı</label>
                                <input
                                    type="text"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Site Açıklaması</label>
                                <input
                                    type="text"
                                    name="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">📞 İletişim Bilgileri</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Destek E-posta</label>
                                <input
                                    type="email"
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Destek Telefon</label>
                                <input
                                    type="text"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">💼 İş Ayarları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Komisyon Oranı (%)</label>
                                <input
                                    type="number"
                                    name="commissionRate"
                                    value={settings.commissionRate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Minimum Sipariş (TL)</label>
                                <input
                                    type="number"
                                    name="minOrderAmount"
                                    value={settings.minOrderAmount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Ücretsiz Kargo Limiti (TL)</label>
                                <input
                                    type="number"
                                    name="freeShippingLimit"
                                    value={settings.freeShippingLimit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">🔧 Sistem Ayarları</h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label className="text-gray-700">
                                Bakım Modu
                                <span className="text-gray-500 text-sm ml-1">(Site geçici olarak kapatılır)</span>
                            </label>
                        </div>
                        {settings.maintenanceMode && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                ⚠️ Bakım modu aktif olduğunda kullanıcılar siteye erişemez.
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2 shadow-lg"
                        >
                            {saving ? (
                                <>
                                    <ButtonSpinner />
                                    <span>Kaydediliyor...</span>
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    <span>Ayarları Kaydet</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}