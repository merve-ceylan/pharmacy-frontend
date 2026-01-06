'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Geçersiz veya eksik token');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (formData.password.length < 8) {
            setError('Şifre en az 8 karakter olmalı');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: formData.password,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                const data = await res.json();
                setError(data.message || 'Şifre sıfırlanamadı');
            }
        } catch (err) {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold mb-4">Şifre Değiştirildi!</h1>
                    <p className="text-gray-600 mb-6">
                        Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz...
                    </p>
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Giriş yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Yeni Şifre Belirle</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
                )}

                {!token ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Geçersiz şifre sıfırlama bağlantısı.</p>
                        <Link href="/forgot-password" className="text-blue-600 hover:underline">
                            Yeni bağlantı iste
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Yeni Şifre</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Şifre Tekrar</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                        >
                            {loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}