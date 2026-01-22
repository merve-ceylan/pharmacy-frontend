'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';
import { settingsApi } from '@/lib/api';

interface Settings {
    id?: number;
    platformName: string;
    platformEmail: string;
    supportEmail: string;
    supportPhone: string;
    gracePeriodDays: number;
    dataRetentionDays: number;
    maxFailedLoginAttempts: number;
    accountLockoutMinutes: number;
    emailEnabled: boolean;
    emailFromName: string;
    emailFromAddress: string;
    trialPeriodDays: number;
    allowCustomDomains: boolean;
    maintenanceMode: boolean;
    registrationsEnabled: boolean;
    emailVerificationRequired: boolean;
}

export default function SettingsPage() {
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        platformName: '',
        platformEmail: '',
        supportEmail: '',
        supportPhone: '',
        gracePeriodDays: 7,
        dataRetentionDays: 30,
        maxFailedLoginAttempts: 5,
        accountLockoutMinutes: 30,
        emailEnabled: true,
        emailFromName: '',
        emailFromAddress: '',
        trialPeriodDays: 14,
        allowCustomDomains: true,
        maintenanceMode: false,
        registrationsEnabled: true,
        emailVerificationRequired: false,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsApi.get();
            setSettings(data);
        } catch (err) {
            showError('Ayarlar yüklenemedi');
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await settingsApi.update({...settings});
            setSettings(response.data);
            showSuccess('Ayarlar başarıyla kaydedildi!');
        } catch (err) {
            showError('Ayarlar kaydedilemedi');
            console.error('Failed to update settings:', err);
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
                    {[...Array(5)].map((_, i) => (
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
                    {/* Platform Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">🏷️ Platform Bilgileri</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Platform Adı</label>
                                <input
                                    type="text"
                                    name="platformName"
                                    value={settings.platformName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Platform E-posta</label>
                                <input
                                    type="email"
                                    name="platformEmail"
                                    value={settings.platformEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">📞 Destek İletişim</h2>
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

                    {/* Email Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">📧 E-posta Ayarları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Gönderen Adı</label>
                                <input
                                    type="text"
                                    name="emailFromName"
                                    value={settings.emailFromName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Gönderen E-posta</label>
                                <input
                                    type="email"
                                    name="emailFromAddress"
                                    value={settings.emailFromAddress}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    name="emailEnabled"
                                    checked={settings.emailEnabled}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-gray-700">E-posta Aktif</label>
                            </div>
                        </div>
                    </div>

                    {/* Business Rules */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">💼 İş Kuralları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Deneme Süresi (gün)</label>
                                <input
                                    type="number"
                                    name="trialPeriodDays"
                                    value={settings.trialPeriodDays}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Ek Süre (gün)</label>
                                <input
                                    type="number"
                                    name="gracePeriodDays"
                                    value={settings.gracePeriodDays}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Veri Saklama (gün)</label>
                                <input
                                    type="number"
                                    name="dataRetentionDays"
                                    value={settings.dataRetentionDays}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    name="allowCustomDomains"
                                    checked={settings.allowCustomDomains}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-gray-700">Özel Domain İzni</label>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">🔒 Güvenlik Ayarları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Max Başarısız Giriş</label>
                                <input
                                    type="number"
                                    name="maxFailedLoginAttempts"
                                    value={settings.maxFailedLoginAttempts}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Hesap Kilidi Süresi (dk)</label>
                                <input
                                    type="number"
                                    name="accountLockoutMinutes"
                                    value={settings.accountLockoutMinutes}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature Flags */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-4">🎛️ Özellik Ayarları</h2>
                        <div className="space-y-3">
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
                                <div className="ml-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                    ⚠️ Bakım modu aktif olduğunda kullanıcılar siteye erişemez.
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="registrationsEnabled"
                                    checked={settings.registrationsEnabled}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-gray-700">Yeni Kayıtlar Açık</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="emailVerificationRequired"
                                    checked={settings.emailVerificationRequired}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-gray-700">E-posta Doğrulama Zorunlu</label>
                            </div>
                        </div>
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