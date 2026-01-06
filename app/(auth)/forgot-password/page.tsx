'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError(data.message || 'İşlem başarısız');
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
                    <div className="text-6xl mb-4">📧</div>
                    <h1 className="text-2xl font-bold mb-4">E-posta Gönderildi!</h1>
                    <p className="text-gray-600 mb-6">
                        Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
                    </p>
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2">Şifremi Unuttum</h1>
                <p className="text-gray-500 text-center mb-6">
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                    >
                        {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        ← Giriş sayfasına dön
                    </Link>
                </p>
            </div>
        </div>
    );
}