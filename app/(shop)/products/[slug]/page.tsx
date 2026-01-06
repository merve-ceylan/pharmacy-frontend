'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, cartApi } from '@/lib/api';
import { Product } from '@/types';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);

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
            window.location.href = '/login';
            return;
        }

        try {
            if (isFavorite && favoriteId) {
                await fetch(`http://localhost:8080/api/customer/favorites/${favoriteId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsFavorite(false);
                setFavoriteId(null);
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
                }
            }
        } catch (err) {
            console.error('Favori işlemi başarısız', err);
            alert('İşlem başarısız');
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        if (!product) return;

        setAddingToCart(true);
        try {
            await cartApi.addItem(1, product.id, quantity);
            alert('Ürün sepete eklendi!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepete eklenemedi';
            alert(errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">{error || 'Ürün bulunamadı'}</p>
                    <Link href="/products" className="text-blue-600 hover:underline">
                        Ürünlere Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm">
                    <Link href="/" className="text-gray-500 hover:text-blue-600">Ana Sayfa</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link href="/products" className="text-gray-500 hover:text-blue-600">Ürünler</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-700">{product.name}</span>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ürün Görseli */}
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96 text-9xl">
                            💊
                        </div>

                        {/* Ürün Bilgileri */}
                        <div>
                            {/* Başlık ve Favori Butonu */}
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl font-bold">{product.name}</h1>
                                <button
                                    onClick={toggleFavorite}
                                    className="text-3xl hover:scale-110 transition"
                                    title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                                >
                                    {isFavorite ? '❤️' : '🤍'}
                                </button>
                            </div>

                            <p className="text-gray-500 mb-4">SKU: {product.sku}</p>

                            {/* Fiyat */}
                            <div className="mb-6">
                                {product.discountedPrice ? (
                                    <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-xl">
                      {product.price.toFixed(2)} TL
                    </span>
                                        <span className="text-green-600 font-bold text-3xl">
                      {product.discountedPrice.toFixed(2)} TL
                    </span>
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                      %{product.discountPercentage} İndirim
                    </span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold">{product.price.toFixed(2)} TL</span>
                                )}
                            </div>

                            {/* Stok Durumu */}
                            <div className="mb-6">
                                {product.inStock ? (
                                    <span className="text-green-600 flex items-center gap-2">
                    ✓ Stokta {product.lowStock && `(Son ${product.stockQuantity} adet)`}
                  </span>
                                ) : (
                                    <span className="text-red-600">✗ Stokta Yok</span>
                                )}
                            </div>

                            {/* Kategori */}
                            <div className="mb-6">
                                <span className="text-gray-500">Kategori: </span>
                                <span className="text-blue-600">{product.categoryName}</span>
                            </div>

                            {/* Açıklama */}
                            {product.shortDescription && (
                                <p className="text-gray-600 mb-6">{product.shortDescription}</p>
                            )}

                            {/* Miktar ve Sepete Ekle */}
                            {product.inStock && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 border-x">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                            className="px-4 py-2 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                    >
                                        {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detaylı Açıklama */}
                    {product.description && (
                        <div className="mt-8 pt-8 border-t">
                            <h2 className="text-xl font-bold mb-4">Ürün Açıklaması</h2>
                            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}