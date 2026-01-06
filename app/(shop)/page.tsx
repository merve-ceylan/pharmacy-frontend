'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    category: Category;
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load categories
                const catRes = await fetch('http://localhost:8080/api/public/categories');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData.slice(0, 6));
                }

                // Load featured products
                const prodRes = await fetch('http://localhost:8080/api/public/products?size=8');
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setFeaturedProducts(prodData.content || prodData || []);
                }
            } catch (err) {
                console.error('Data load error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Sağlığınız İçin Güvenilir Eczaneniz
                    </h1>
                    <p className="text-xl mb-8 text-blue-100">
                        Binlerce ürün, hızlı teslimat, güvenli alışveriş
                    </p>
                    <Link
                        href="/products"
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
                    >
                        Alışverişe Başla
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8">Kategoriler</h2>
                    {loading ? (
                        <div className="text-center text-gray-500">Yükleniyor...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/products?category=${category.slug}`}
                                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
                                >
                                    <span className="text-3xl mb-2 block">💊</span>
                                    <span className="font-medium text-gray-700">{category.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8">Öne Çıkan Ürünler</h2>
                    {loading ? (
                        <div className="text-center text-gray-500">Yükleniyor...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                                >
                                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl">💊</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                                        <p className="text-blue-600 font-bold">{product.price?.toFixed(2)} TL</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-8">
                        <Link
                            href="/products"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
                        >
                            Tüm Ürünleri Gör
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <span className="text-4xl mb-4 block">🚚</span>
                            <h3 className="font-bold text-lg mb-2">Hızlı Teslimat</h3>
                            <p className="text-gray-600">Aynı gün kargo ile hızlı teslimat</p>
                        </div>
                        <div className="text-center">
                            <span className="text-4xl mb-4 block">🔒</span>
                            <h3 className="font-bold text-lg mb-2">Güvenli Ödeme</h3>
                            <p className="text-gray-600">256-bit SSL ile güvenli alışveriş</p>
                        </div>
                        <div className="text-center">
                            <span className="text-4xl mb-4 block">📞</span>
                            <h3 className="font-bold text-lg mb-2">7/24 Destek</h3>
                            <p className="text-gray-600">Her zaman yanınızdayız</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}