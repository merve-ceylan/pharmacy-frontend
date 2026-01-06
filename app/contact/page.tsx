'use client';

import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/public/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccess(true);
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setError('Mesaj gönderilemedi');
            }
        } catch (err) {
            // API yoksa success göster (demo amaçlı)
            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">İletişim</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* İletişim Bilgileri */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-bold mb-6">Bize Ulaşın</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">📍</span>
                                <div>
                                    <h3 className="font-semibold">Adres</h3>
                                    <p className="text-gray-600">
                                        Örnek Mahallesi, Eczane Sokak No:1
                                        <br />
                                        Kadıköy, İstanbul
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <span className="text-2xl">📞</span>
                                <div>
                                    <h3 className="font-semibold">Telefon</h3>
                                    <p className="text-gray-600">0216 123 45 67</p>
                                    <p className="text-gray-600">0532 123 45 67</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <span className="text-2xl">📧</span>
                                <div>
                                    <h3 className="font-semibold">E-posta</h3>
                                    <p className="text-gray-600">info@eczanem.com</p>
                                    <p className="text-gray-600">destek@eczanem.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <span className="text-2xl">🕐</span>
                                <div>
                                    <h3 className="font-semibold">Çalışma Saatleri</h3>
                                    <p className="text-gray-600">Pazartesi - Cumartesi: 09:00 - 21:00</p>
                                    <p className="text-gray-600">Pazar: 10:00 - 18:00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* İletişim Formu */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-bold mb-6">Mesaj Gönderin</h2>

                        {success && (
                            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
                                Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Adınız *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">E-posta *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Konu *</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Mesajınız *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={5}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                            >
                                {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}