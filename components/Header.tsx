'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export default function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [isClient, setIsClient] = useState(false);
// eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setIsClient(true);
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('User parse error:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'PHARMACY_OWNER' || user?.role === 'STAFF';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🏥</span>
                        <span className="text-xl font-bold text-blue-600">Eczanem</span>
                    </Link>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ürün ara..."
                                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                                🔍
                            </button>
                        </div>
                    </form>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/products" className="text-gray-600 hover:text-blue-600 transition">Ürünler</Link>
                        {isClient && user && (
                            <Link href="/favorites" className="text-gray-600 hover:text-blue-600 transition">❤️ Favoriler</Link>
                        )}
                        <Link href="/cart" className="text-gray-600 hover:text-blue-600 transition">🛒 Sepet</Link>
                        {isClient && isAdmin && (
                            <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium transition">
                                ⚙️ Yönetim Paneli
                            </Link>
                        )}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isClient ? (
                            // Loading state
                            <div className="text-gray-400">...</div>
                        ) : user ? (
                            <>
                                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition">👤 {user.firstName}</Link>
                                <Link href="/orders" className="text-gray-600 hover:text-blue-600 transition">Siparişlerim</Link>
                                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 transition">Çıkış</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">Giriş Yap</Link>
                                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                    Kayıt Ol
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
                        {isMenuOpen ? <span className="text-2xl">✕</span> : <span className="text-2xl">☰</span>}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t py-4">
                        <form onSubmit={handleSearch} className="mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ürün ara..."
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </form>
                        <nav className="flex flex-col gap-4">
                            <Link href="/products" className="text-gray-600" onClick={() => setIsMenuOpen(false)}>Ürünler</Link>
                            {user && (
                                <Link href="/favorites" className="text-gray-600" onClick={() => setIsMenuOpen(false)}>❤️ Favoriler</Link>
                            )}
                            <Link href="/cart" className="text-gray-600" onClick={() => setIsMenuOpen(false)}>🛒 Sepet</Link>
                            {isAdmin && (
                                <Link href="/dashboard" className="text-purple-600 font-medium" onClick={() => setIsMenuOpen(false)}>⚙️ Yönetim Paneli</Link>
                            )}
                            <hr className="my-2" />
                            {user ? (
                                <>
                                    <Link href="/profile" className="text-gray-600" onClick={() => setIsMenuOpen(false)}>👤 {user.firstName}</Link>
                                    <Link href="/orders" className="text-gray-600" onClick={() => setIsMenuOpen(false)}>Siparişlerim</Link>
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-red-600 text-left">Çıkış</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-600" onClick={() => setIsMenuOpen(false)}>Giriş Yap</Link>
                                    <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>Kayıt Ol</Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}