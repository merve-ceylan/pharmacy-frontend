'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cartApi } from '@/lib/api';
import { Cart } from '@/types';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const loadCart = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await cartApi.get(1);
            setCart(response.data || response);
            setError('');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepet yüklenemedi';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
        if (token) {
            loadCart();
        } else {
            setLoading(false);
        }
    }, [loadCart]);

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdating(itemId);
        try {
            await cartApi.updateItem(1, itemId, newQuantity);
            await loadCart();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Güncellenemedi';
            alert(errorMessage);
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (itemId: number) => {
        setUpdating(itemId);
        try {
            await cartApi.removeItem(1, itemId);
            await loadCart();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Silinemedi';
            alert(errorMessage);
        } finally {
            setUpdating(null);
        }
    };

    const handleCheckout = () => {
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Sepeti görüntülemek için giriş yapın</h1>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">🛒 Sepetim</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sepet Ürünleri */}
                    <div className="lg:col-span-2">
                        {!cart || cart.items.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <p className="text-gray-500 text-lg">Sepetiniz boş</p>
                                <Link
                                    href="/products"
                                    className="text-blue-600 hover:underline mt-2 inline-block"
                                >
                                    Alışverişe Başla
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center p-4 border-b last:border-b-0"
                                    >
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                                            💊
                                        </div>

                                        <div className="flex-1 ml-4">
                                            <h3 className="font-semibold">{item.productName}</h3>
                                            <p className="text-green-600 font-bold">
                                                {item.effectivePrice.toFixed(2)} TL
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={updating === item.id || item.quantity <= 1}
                                                className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={updating === item.id}
                                                className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="ml-4 text-right">
                                            <p className="font-bold">{item.totalPrice.toFixed(2)} TL</p>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                disabled={updating === item.id}
                                                className="text-red-500 text-sm hover:underline disabled:opacity-50"
                                            >
                                                {updating === item.id ? 'Siliniyor...' : 'Kaldır'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sipariş Özeti */}
                    {cart && cart.items.length > 0 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ara Toplam</span>
                                        <span>{cart.subtotal.toFixed(2)} TL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kargo</span>
                                        <span>{cart.estimatedShipping.toFixed(2)} TL</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mb-6">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Toplam</span>
                                        <span className="text-green-600">
                      {cart.estimatedTotal.toFixed(2)} TL
                    </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                                >
                                    Siparişi Tamamla
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}