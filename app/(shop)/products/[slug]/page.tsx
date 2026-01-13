'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi, cartApi } from '@/lib/api';
import { Product } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { showSuccess, showError } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [slug]);

    useEffect(() => {
        if (product) {
            checkFavorite();
        }
    }, [product]);

    const loadProduct = async () => {
        try {
            const response = await productsApi.getBySlug(1, slug);
            setProduct(response.data || response);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Ürün bulunamadı';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const checkFavorite = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !product) return;

        try {
            const res = await fetch(`http://localhost:8080/api/customer/favorites/check/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setIsFavorite(data.isFavorite);
                setFavoriteId(data.favoriteId);
            }
        } catch (err) {
            console.error('Favori durumu alınamadı', err);
        }
    };

    const toggleFavorite = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showError('Favorilere eklemek için giriş yapmalısınız');
            router.push('/login');
            return;
        }

        setFavoriteLoading(true);
        try {
            if (isFavorite && favoriteId) {
                await fetch(`http://localhost:8080/api/customer/favorites/${favoriteId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsFavorite(false);
                setFavoriteId(null);
                showSuccess('Favorilerden kaldırıldı');
            } else {
                const res = await fetch('http://localhost:8080/api/customer/favorites', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId: product?.id }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsFavorite(true);
                    setFavoriteId(data.id);
                    showSuccess('Favorilere eklendi ❤️');
                }
            }
        } catch (err) {
            console.error('Favori işlemi başarısız', err);
            showError('İşlem başarısız');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showError('Sepete eklemek için giriş yapmalısınız');
            router.push('/login');
            return;
        }

        if (!product) return;

        setAddingToCart(true);
        try {
            await cartApi.addItem(1, product.id, quantity);
            showSuccess(`${quantity} adet ürün sepete eklendi! 🛒`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepete eklenemedi';
            showError(errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showError('Satın almak için giriş yapmalısınız');
            router.push('/login');
            return;
        }

        if (!product) return;

        setAddingToCart(true);
        try {
            await cartApi.addItem(1, product.id, quantity);
            router.push('/checkout');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            showError(errorMessage);
            setAddingToCart(false);
        }
    };

    // Skeleton Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb Skeleton */}
                    <div className="mb-6">
                        <Skeleton width="300px" height="20px" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Image Skeleton */}
                            <Skeleton variant="rectangular" height="400px" className="rounded-xl" />

                            {/* Info Skeleton */}
                            <div>
                                <Skeleton width="80%" height="36px" className="mb-2" />
                                <Skeleton width="120px" height="20px" className="mb-6" />
                                <Skeleton width="200px" height="40px" className="mb-6" />
                                <Skeleton width="150px" height="24px" className="mb-4" />
                                <Skeleton width="100px" height="24px" className="mb-6" />
                                <Skeleton width="100%" height="60px" className="mb-4" />
                                <div className="flex gap-4">
                                    <Skeleton variant="rectangular" width="120px" height="50px" />
                                    <Skeleton variant="rectangular" height="50px" className="flex-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">😕</div>
                    <p className="text-red-600 text-xl mb-4">{error || 'Ürün bulunamadı'}</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        <span>←</span>
                        <span>Ürünlere Dön</span>
                    </Link>
                </div>
            </div>
        );
    }

    const discountPercent = product.discountedPrice
        ? Math.round((1 - product.discountedPrice / product.price) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm flex items-center gap-2 flex-wrap">
                    <Link href="/" className="text-gray-500 hover:text-blue-600 transition">
                        🏠 Ana Sayfa
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link href="/products" className="text-gray-500 hover:text-blue-600 transition">
                        Ürünler
                    </Link>
                    {product.categoryName && (
                        <>
                            <span className="text-gray-400">/</span>
                            <Link
                                href={`/products?category=${product.categoryId}`}
                                className="text-gray-500 hover:text-blue-600 transition"
                            >
                                {product.categoryName}
                            </Link>
                        </>
                    )}
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-700 font-medium">{product.name}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Ürün Görseli */}
                        <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 flex items-center justify-center min-h-[400px] p-8">
                            {/* İndirim Badge */}
                            {discountPercent > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    %{discountPercent} İNDİRİM
                                </div>
                            )}

                            {/* Stok Uyarısı */}
                            {product.lowStock && product.inStock && (
                                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                    Son {product.stockQuantity} Adet!
                                </div>
                            )}

                            <span className="text-[150px] drop-shadow-lg">💊</span>
                        </div>

                        {/* Ürün Bilgileri */}
                        <div className="p-6 md:p-8">
                            {/* Başlık ve Favori Butonu */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{product.name}</h1>
                                <button
                                    onClick={toggleFavorite}
                                    disabled={favoriteLoading}
                                    className={`text-3xl hover:scale-125 transition-transform ${favoriteLoading ? 'opacity-50' : ''}`}
                                    title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                                >
                                    {favoriteLoading ? '⏳' : isFavorite ? '❤️' : '🤍'}
                                </button>
                            </div>

                            {/* SKU ve Kategori */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="text-gray-400 text-sm">SKU: {product.sku}</span>
                                <span className="text-gray-300">|</span>
                                <Link
                                    href={`/products?category=${product.categoryId}`}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    {product.categoryName}
                                </Link>
                            </div>

                            {/* Fiyat */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                {product.discountedPrice ? (
                                    <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-gray-400 line-through text-xl">
                      {product.price.toFixed(2)} TL
                    </span>
                                        <span className="text-green-600 font-bold text-3xl">
                      {product.discountedPrice.toFixed(2)} TL
                    </span>
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                      %{discountPercent} Kazanç
                    </span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-800">{product.price.toFixed(2)} TL</span>
                                )}
                            </div>

                            {/* Stok Durumu */}
                            <div className="mb-6">
                                {product.inStock ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="font-medium">
                      Stokta {product.lowStock && `(Son ${product.stockQuantity} adet)`}
                    </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                        <span className="font-medium">Stokta Yok</span>
                                    </div>
                                )}
                            </div>

                            {/* Açıklama */}
                            {product.shortDescription && (
                                <p className="text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
                            )}

                            {/* Miktar ve Butonlar */}
                            {product.inStock ? (
                                <div className="space-y-4">
                                    {/* Miktar Seçici */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600 font-medium">Adet:</span>
                                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-4 py-3 hover:bg-gray-100 transition text-lg font-medium"
                                            >
                                                −
                                            </button>
                                            <span className="px-6 py-3 border-x-2 border-gray-200 font-bold text-lg min-w-[60px] text-center">
                        {quantity}
                      </span>
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                                className="px-4 py-3 hover:bg-gray-100 transition text-lg font-medium"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-gray-400 text-sm">
                      (Maks: {product.stockQuantity})
                    </span>
                                    </div>

                                    {/* Butonlar */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={addingToCart}
                                            className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                        >
                                            {addingToCart ? (
                                                <>
                                                    <ButtonSpinner />
                                                    <span>Ekleniyor...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>🛒</span>
                                                    <span>Sepete Ekle</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={addingToCart}
                                            className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-all disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                        >
                                            <span>⚡</span>
                                            <span>Hemen Al</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                    <p className="text-red-600 font-medium mb-2">Bu ürün şu anda stokta yok</p>
                                    <p className="text-gray-500 text-sm">Stok geldiğinde haberdar olmak ister misiniz?</p>
                                    <button className="mt-3 text-blue-600 hover:underline text-sm font-medium">
                                        📧 Beni Bilgilendir
                                    </button>
                                </div>
                            )}

                            {/* Güvence Bilgileri */}
                            <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-lg">🚚</span>
                                    <span>Hızlı Kargo</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-lg">🔒</span>
                                    <span>Güvenli Ödeme</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-lg">↩️</span>
                                    <span>Kolay İade</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-lg">✅</span>
                                    <span>Orijinal Ürün</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detaylı Açıklama */}
                    {product.description && (
                        <div className="p-6 md:p-8 border-t bg-gray-50">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>📋</span>
                                <span>Ürün Açıklaması</span>
                            </h2>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{product.description}</p>
                        </div>
                    )}
                </div>

                {/* Alt Bilgi Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                            🚚
                        </div>
                        <div>
                            <h4 className="font-semibold">Ücretsiz Kargo</h4>
                            <p className="text-gray-500 text-sm">150 TL üzeri siparişlerde</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                            🔄
                        </div>
                        <div>
                            <h4 className="font-semibold">14 Gün İade</h4>
                            <p className="text-gray-500 text-sm">Koşulsuz iade garantisi</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                            💳
                        </div>
                        <div>
                            <h4 className="font-semibold">Güvenli Ödeme</h4>
                            <p className="text-gray-500 text-sm">256-bit SSL şifreleme</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}