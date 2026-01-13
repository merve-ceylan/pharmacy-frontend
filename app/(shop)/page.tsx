'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi, categoriesApi, cartApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    discountedPrice?: number;
    imageUrl?: string;
    inStock: boolean;
    categoryName?: string;
}

export default function HomePage() {
    const { showSuccess, showError } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load categories
            const catData = await categoriesApi.getAll();
            setCategories((catData || []).slice(0, 6));

            // Load featured products
            const prodData = await productsApi.getFeatured(1);
            setFeaturedProducts((prodData.content || prodData || []).slice(0, 8));
        } catch (err) {
            console.error('Data load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('accessToken');
        if (!token) {
            showError('Sepete eklemek için giriş yapmalısınız');
            return;
        }

        setAddingToCart(productId);
        try {
            await cartApi.addItem(1, productId, 1);
            showSuccess('Ürün sepete eklendi! 🛒');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepete eklenemedi';
            showError(errorMessage);
        } finally {
            setAddingToCart(null);
        }
    };

    const categoryIcons: Record<string, string> = {
        'agri-kesiciler': '💊',
        'vitaminler': '🍊',
        'cilt-bakimi': '🧴',
        'anne-bebek': '👶',
        'saglik-urunleri': '❤️',
        'default': '💊'
    };

    const getCategoryIcon = (slug: string) => {
        return categoryIcons[slug] || categoryIcons['default'];
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-8xl">💊</div>
                    <div className="absolute top-20 right-20 text-6xl">🏥</div>
                    <div className="absolute bottom-10 left-1/4 text-7xl">❤️</div>
                    <div className="absolute bottom-20 right-1/3 text-5xl">🩺</div>
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                        Sağlığınız İçin <br />
                        <span className="text-blue-200">Güvenilir Eczaneniz</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
                        Binlerce ürün, hızlı teslimat, güvenli alışveriş
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/products"
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                        >
                            🛒 Alışverişe Başla
                        </Link>
                        <Link
                            href="/products?featured=true"
                            className="bg-blue-500 bg-opacity-30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-50 transition-all border border-white border-opacity-30"
                        >
                            ⭐ Öne Çıkanlar
                        </Link>
                    </div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
                    </svg>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Kategoriler</h2>
                        <p className="text-gray-600">İhtiyacınız olan ürünleri kolayca bulun</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                                    <Skeleton variant="circular" width="60px" height="60px" className="mx-auto mb-3" />
                                    <Skeleton width="80%" height="20px" className="mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center text-gray-500">Kategori bulunamadı</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/products?category=${category.slug}`}
                                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 text-center group"
                                >
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                                        <span className="text-3xl">{getCategoryIcon(category.slug)}</span>
                                    </div>
                                    <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">⭐ Öne Çıkan Ürünler</h2>
                        <p className="text-gray-600">En çok tercih edilen ürünlerimiz</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-md p-4">
                                    <Skeleton variant="rectangular" height="160px" className="mb-4 rounded-lg" />
                                    <Skeleton width="80%" height="20px" className="mb-2" />
                                    <Skeleton width="50%" height="16px" className="mb-3" />
                                    <div className="flex justify-between items-center">
                                        <Skeleton width="70px" height="24px" />
                                        <Skeleton variant="rectangular" width="100px" height="36px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="text-center text-gray-500">Ürün bulunamadı</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
                                >
                                    <Link href={`/products/${product.slug}`}>
                                        <div className="h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">💊</span>
                                            {product.discountedPrice && (
                                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          %{Math.round((1 - product.discountedPrice / product.price) * 100)}
                        </span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-4">
                                        <Link href={`/products/${product.slug}`}>
                                            <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm mb-3">{product.categoryName}</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {product.discountedPrice ? (
                                                    <>
                            <span className="text-gray-400 line-through text-sm block">
                              {product.price.toFixed(2)} TL
                            </span>
                                                        <span className="text-green-600 font-bold">
                              {product.discountedPrice.toFixed(2)} TL
                            </span>
                                                    </>
                                                ) : (
                                                    <span className="text-blue-600 font-bold">
                            {product.price?.toFixed(2)} TL
                          </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(e, product.id)}
                                                disabled={!product.inStock || addingToCart === product.id}
                                                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                                            >
                                                {addingToCart === product.id ? (
                                                    <ButtonSpinner />
                                                ) : (
                                                    <>
                                                        <span>🛒</span>
                                                        <span className="hidden sm:inline">Ekle</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                        >
                            <span>Tüm Ürünleri Gör</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Neden Biz?</h2>
                        <p className="text-gray-600">Size en iyi hizmeti sunmak için buradayız</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center group">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                                <span className="text-4xl">🚚</span>
                            </div>
                            <h3 className="font-bold text-xl mb-3">Hızlı Teslimat</h3>
                            <p className="text-gray-600">Siparişleriniz aynı gün kargoya verilir, en hızlı şekilde kapınıza ulaşır.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center group">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                                <span className="text-4xl">🔒</span>
                            </div>
                            <h3 className="font-bold text-xl mb-3">Güvenli Ödeme</h3>
                            <p className="text-gray-600">256-bit SSL şifreleme ile tüm ödemeleriniz güvence altında.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center group">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                                <span className="text-4xl">📞</span>
                            </div>
                            <h3 className="font-bold text-xl mb-3">7/24 Destek</h3>
                            <p className="text-gray-600">Sorularınız için her zaman yanınızdayız. Bize ulaşmaktan çekinmeyin.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isLoggedIn && (
            <section className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Sağlığınız İçin Hemen Başlayın!
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                        Ücretsiz üye olun, özel indirimlerden ve kampanyalardan haberdar olun.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Ücretsiz Üye Ol
                        </Link>
                        <Link
                            href="/products"
                            className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-all border border-white border-opacity-30"
                        >
                            Ürünleri Keşfet
                        </Link>
                    </div>
                </div>
            </section>
            )}
        </div>
    );
}