'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cartApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

interface FavoriteProduct {
    id: number;
    productId: number;
    productName: string;
    productSlug: string;
    productPrice: number;
    productDiscountedPrice?: number;
    productImageUrl?: string;
    createdAt: string;
}

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/customer/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(data || []);
            }
        } catch (err) {
            console.error('Favoriler yüklenemedi', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (favoriteId: number) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/customer/favorites/${favoriteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setFavorites(favorites.filter((f) => f.id !== favoriteId));
            }
        } catch (err) {
            console.error('Favori silme hatası', err);
            showSuccess('Silinemedi');
        }
    };

    const handleAddToCart = async (productId: number) => {
        setAddingToCart(productId);
        try {
            await cartApi.addItem(1, productId, 1);
            showSuccess('Ürün sepete eklendi!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepete eklenemedi';
            showSuccess(errorMessage);
        } finally {
            setAddingToCart(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8">❤️ Favorilerim</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">❤️ Favorilerim</h1>

                {favorites.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500 text-lg mb-4">Henüz favori ürününüz yok</p>
                        <Link href="/products" className="text-blue-600 hover:underline">
                            Ürünleri Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((favorite) => (
                            <div
                                key={favorite.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                <Link href={`/products/${favorite.productSlug}`} className="block">
                                    <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
                                        💊
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Link href={`/products/${favorite.productSlug}`}>
                                            <h2 className="text-lg font-semibold hover:text-blue-600">
                                                {favorite.productName}
                                            </h2>
                                        </Link>
                                        <button
                                            onClick={() => removeFavorite(favorite.id)}
                                            className="text-red-500 hover:text-red-600 text-xl"
                                            title="Favorilerden kaldır"
                                        >
                                            ❤️
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        {favorite.productDiscountedPrice ? (
                                            <>
                        <span className="text-gray-400 line-through">
                          {favorite.productPrice.toFixed(2)} TL
                        </span>
                                                <span className="text-green-600 font-bold">
                          {favorite.productDiscountedPrice.toFixed(2)} TL
                        </span>
                                            </>
                                        ) : (
                                            <span className="font-bold">{favorite.productPrice.toFixed(2)} TL</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(favorite.productId)}
                                        disabled={addingToCart === favorite.productId}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                    >
                                        {addingToCart === favorite.productId ? 'Ekleniyor...' : 'Sepete Ekle'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}