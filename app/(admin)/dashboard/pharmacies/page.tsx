'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';
import { pharmaciesApi } from '@/lib/api';

interface MonthlyStats {
    month: string;
    orderCount: number;
    revenue: number;
}

interface Pharmacy {
    id: number;
    name: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    subdomain: string;
    customDomain: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_CANCELLATION';
    subscriptionPlan: 'STANDARD' | 'PRO';
    createdAt: string;
    productCount?: number;
}

interface PharmacyStatsResponse {
    pharmacyId: number;
    pharmacyName: string;
    monthlyStats: MonthlyStats[];
    totalRevenue: number;
    totalOrders: number;
}

export default function PharmaciesPage() {
    const { showSuccess, showError } = useToast();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [pharmacyStats, setPharmacyStats] = useState<PharmacyStatsResponse | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        loadPharmacies();
    }, []);

    const loadPharmacies = async () => {
        try {
            setLoading(true);
            const data = await pharmaciesApi.getAll();
            setPharmacies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load pharmacies:', err);
            showError('Eczaneler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        setTogglingId(id);
        try {
            if (currentStatus === 'ACTIVE') {
                await pharmaciesApi.suspend(id);
                showSuccess('Eczane pasifleştirildi');
            } else {
                await pharmaciesApi.reactivate(id);
                showSuccess('Eczane aktifleştirildi');
            }
            loadPharmacies();
        } catch (err) {
            console.error('Toggle status error:', err);
            showError('İşlem başarısız');
        } finally {
            setTogglingId(null);
        }
    };

    const openDetailModal = async (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setShowDetailModal(true);
        setLoadingStats(true);
        setPharmacyStats(null);

        try {
            const stats = await pharmaciesApi.getStats(pharmacy.id, 6);
            setPharmacyStats(stats);
        } catch (err) {
            console.error('Failed to load stats:', err);
            showError('İstatistikler yüklenemedi');
        } finally {
            setLoadingStats(false);
        }
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${months[parseInt(month) - 1]} ${year}`;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800',
            SUSPENDED: 'bg-red-100 text-red-800',
            PENDING_CANCELLATION: 'bg-yellow-100 text-yellow-800',
        };
        const labels: Record<string, string> = {
            ACTIVE: 'Aktif',
            SUSPENDED: 'Pasif',
            PENDING_CANCELLATION: 'İptal Bekliyor',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPlanBadge = (plan: string) => {
        const styles: Record<string, string> = {
            STANDARD: 'bg-gray-100 text-gray-800',
            PRO: 'bg-purple-100 text-purple-800',
        };
        const labels: Record<string, string> = {
            STANDARD: 'Standard',
            PRO: 'Pro',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[plan]}`}>
                {labels[plan] || plan}
            </span>
        );
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = pharmacies.filter(p => p.status === 'ACTIVE').length;
    const suspendedCount = pharmacies.filter(p => p.status === 'SUSPENDED').length;
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Skeleton width="60px" height="24px" />
                            <Skeleton width="200px" height="32px" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between mb-6">
                        <Skeleton width="300px" height="40px" variant="rectangular" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <Skeleton width="80px" height="16px" className="mb-2" />
                                <Skeleton width="50px" height="32px" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                {[...Array(6)].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left">
                                        <Skeleton width="60px" height="16px" />
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <Skeleton width="120px" height="20px" className="mb-1" />
                                        <Skeleton width="150px" height="16px" />
                                    </td>
                                    <td className="px-6 py-4"><Skeleton width="80px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="70px" height="20px" /></td>
                                    <td className="px-6 py-4"><Skeleton width="70px" height="24px" variant="rectangular" /></td>
                                    <td className="px-6 py-4"><Skeleton width="60px" height="24px" variant="rectangular" /></td>
                                    <td className="px-6 py-4"><Skeleton width="120px" height="20px" /></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
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
                    <div className="text-sm text-gray-500">
                        Toplam: {pharmacies.length} eczane
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Toplam Eczane</p>
                        <p className="text-2xl font-bold">{pharmacies.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Aktif</p>
                        <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                        <p className="text-gray-500 text-sm">Pasif</p>
                        <p className="text-2xl font-bold text-red-600">{suspendedCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eczane</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şehir</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Sayısı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonelik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredPharmacies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">🏥</div>
                                    Eczane bulunamadı
                                </td>
                            </tr>
                        ) : (
                            filteredPharmacies.map((pharmacy) => (
                                <tr key={pharmacy.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{pharmacy.name}</p>
                                        <p className="text-sm text-gray-500">{pharmacy.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{pharmacy.city}</p>
                                        <p className="text-sm text-gray-500">{pharmacy.district}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pharmacy.productCount !== undefined ? (
                                            <span className="font-medium">{pharmacy.productCount}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{getPlanBadge(pharmacy.subscriptionPlan)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(pharmacy.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => openDetailModal(pharmacy)}
                                                className="text-purple-600 hover:underline text-sm"
                                            >
                                                Detay
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(pharmacy.id, pharmacy.status)}
                                                disabled={togglingId === pharmacy.id}
                                                className={`text-sm disabled:opacity-50 ${
                                                    pharmacy.status === 'ACTIVE'
                                                        ? 'text-red-600 hover:underline'
                                                        : 'text-green-600 hover:underline'
                                                }`}
                                            >
                                                {togglingId === pharmacy.id
                                                    ? '...'
                                                    : pharmacy.status === 'ACTIVE'
                                                        ? 'Pasifleştir'
                                                        : 'Aktifleştir'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Detail Modal */}
            {showDetailModal && selectedPharmacy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">📊 {selectedPharmacy.name} - Detay</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Pharmacy Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">E-posta</p>
                                    <p className="font-medium">{selectedPharmacy.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Telefon</p>
                                    <p className="font-medium">{selectedPharmacy.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Şehir</p>
                                    <p className="font-medium">{selectedPharmacy.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">İlçe</p>
                                    <p className="font-medium">{selectedPharmacy.district}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Subdomain</p>
                                    <p className="font-medium text-blue-600">{selectedPharmacy.subdomain}.pharmacy.com</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Kayıt Tarihi</p>
                                    <p className="font-medium">{new Date(selectedPharmacy.createdAt).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Abonelik</p>
                                    {getPlanBadge(selectedPharmacy.subscriptionPlan)}
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Durum</p>
                                    {getStatusBadge(selectedPharmacy.status)}
                                </div>
                            </div>
                        </div>

                        {/* Monthly Stats */}
                        <h3 className="text-lg font-bold mb-4">📈 Aylık Performans</h3>

                        {loadingStats ? (
                            <div className="text-center py-8">
                                <ButtonSpinner />
                                <p className="text-gray-500 mt-2">İstatistikler yükleniyor...</p>
                            </div>
                        ) : !pharmacyStats || pharmacyStats.monthlyStats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">📊</div>
                                Henüz veri bulunmuyor
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-blue-600 text-sm">Toplam Sipariş (6 Ay)</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {pharmacyStats.totalOrders}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-green-600 text-sm">Toplam Gelir (6 Ay)</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {pharmacyStats.totalRevenue.toLocaleString('tr-TR')} TL
                                        </p>
                                    </div>
                                </div>

                                {/* Monthly Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ay</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sipariş</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ort. Sipariş</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                        {pharmacyStats.monthlyStats.map((stat, index) => (
                                            <tr key={stat.month} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                                <td className="px-4 py-3 font-medium">
                                                    {formatMonth(stat.month)}
                                                    {index === 0 && <span className="ml-2 text-xs text-blue-600">(Bu Ay)</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">{stat.orderCount}</td>
                                                <td className="px-4 py-3 text-right text-green-600 font-medium">
                                                    {stat.revenue.toLocaleString('tr-TR')} TL
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500">
                                                    {stat.orderCount > 0
                                                        ? Math.round(stat.revenue / stat.orderCount).toLocaleString('tr-TR')
                                                        : 0} TL
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}