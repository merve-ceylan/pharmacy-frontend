'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { staffApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewStaffPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            toast.error('Lütfen tüm zorunlu alanları doldurun');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Şifre en az 8 karakter olmalıdır');
            return;
        }

        try {
            setLoading(true);
            await staffApi.create(formData);
            toast.success('Personel başarıyla eklendi');
            router.push('/dashboard/staff');
        } catch (error: unknown) {
            const apiError = error as { message?: string };
            toast.error(apiError?.message || 'Personel eklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/staff">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Yeni Personel Ekle</h1>
                    <p className="text-gray-600">Eczanenize yeni personel ekleyin</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Personel Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ad <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ahmet"
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Soyad <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Yılmaz"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                E-posta <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="personel@example.com"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="05xx xxx xx xx"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Şifre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="En az 8 karakter"
                                required
                                minLength={8}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Şifre en az 8 karakter olmalı ve özel karakter içermelidir
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Ekleniyor...' : 'Personel Ekle'}
                            </Button>
                            <Link href="/dashboard/staff" className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    İptal
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}