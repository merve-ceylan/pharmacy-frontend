'use client';

import { useEffect, useState } from 'react';
import { staffApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Plus, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Staff {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    active: boolean;
    createdAt: string;
    pharmacyName: string;
}

export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [staffResponse, statsResponse] = await Promise.all([
                staffApi.getAll(),
                staffApi.getStats(),
            ]);

            setStaff(staffResponse.data || staffResponse || []);
            setStats(statsResponse.data || statsResponse || { total: 0, active: 0, inactive: 0 });
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: number, isActive: boolean) => {
        try {
            if (isActive) {
                await staffApi.deactivate(id);
                toast.success('Personel pasife alındı');
            } else {
                await staffApi.activate(id);
                toast.success('Personel aktif edildi');
            }
            loadData();
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'İşlem başarısız');
        }
    };

    if (loading) {
        return <div className="p-6">Yükleniyor...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
                    <p className="text-gray-600">Eczane personelinizi yönetin</p>
                </div>
                <Link href="/dashboard/staff/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Personel
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Toplam Personel
                        </CardTitle>
                        <Users className="w-4 h-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Aktif Personel
                        </CardTitle>
                        <UserCheck className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pasif Personel
                        </CardTitle>
                        <UserX className="w-4 h-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.inactive}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle>Personel Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left p-4">Ad Soyad</th>
                                <th className="text-left p-4">E-posta</th>
                                <th className="text-left p-4">Telefon</th>
                                <th className="text-left p-4">Durum</th>
                                <th className="text-left p-4">Kayıt Tarihi</th>
                                <th className="text-right p-4">İşlemler</th>
                            </tr>
                            </thead>
                            <tbody>
                            {staff.map((member) => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        {member.firstName} {member.lastName}
                                    </td>
                                    <td className="p-4">{member.email}</td>
                                    <td className="p-4">{member.phone}</td>
                                    <td className="p-4">
                      <span
                          className={`px-2 py-1 rounded-full text-xs ${
                              member.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {member.active ? 'Aktif' : 'Pasif'}
                      </span>
                                    </td>
                                    <td className="p-4">
                                        {new Date(member.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(member.id, member.active)}
                                                >
                                                    {member.active ? 'Pasife Al' : 'Aktif Et'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {staff.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Henüz personel bulunmuyor
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}