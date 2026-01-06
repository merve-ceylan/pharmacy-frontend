'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await authApi.login(email, password);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            const role = response.user?.role;
            if (role === 'SUPER_ADMIN' || role === 'PHARMACY_OWNER' || role === 'STAFF') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Giriş başarısız';
            setError(errorMessage);
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Giriş Yap</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="mb-6 text-right">
                        <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
                            Şifremi Unuttum
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                    >
                        {submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Hesabın yok mu?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Kayıt Ol
                    </Link>
                </p>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Test Hesapları:</p>
                    <p className="text-gray-600">🔴 admin@pharmacy.com / Admin123!@#</p>
                    <p className="text-gray-600">🟣 owner@demo.com / Owner123!@#</p>
                    <p className="text-gray-600">🔵 staff@demo.com / Staff123!@#</p>
                    <p className="text-gray-600">🟢 test@test.com / Pharmacy2024!@#</p>
                </div>
            </div>
        </div>
    );
}