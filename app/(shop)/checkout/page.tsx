'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, ordersApi } from '@/lib/api';
import { Cart } from '@/types';

interface Address {
    id: number;
    title: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        shippingAddress: '',
        shippingCity: '',
        shippingDistrict: '',
        shippingPostalCode: '',
        shippingPhone: '',
        notes: '',
        deliveryType: 'CARGO',
    });

    useEffect(() => {
        loadCart();
        loadAddresses();
    }, []);

    const loadCart = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await cartApi.get(1);
            const cartData = response.data || response;
            if (!cartData || cartData.items.length === 0) {
                router.push('/cart');
                return;
            }
            setCart(cartData);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepet yüklenemedi';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const loadAddresses = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:8080/api/customer/addresses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAddresses(data || []);
                const defaultAddr = data.find((a: Address) => a.isDefault);
                if (defaultAddr) {
                    selectAddress(defaultAddr);
                }
            }
        } catch (err) {
            console.error('Adresler yüklenemedi', err);
        }
    };

    const selectAddress = (address: Address) => {
        setSelectedAddressId(address.id);
        setFormData({
            ...formData,
            shippingAddress: address.address,
            shippingCity: address.city,
            shippingDistrict: address.district,
            shippingPostalCode: address.postalCode,
            shippingPhone: address.phone,
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await ordersApi.create({
                pharmacyId: 1,
                deliveryType: formData.deliveryType,
                shippingAddress: formData.shippingAddress,
                shippingCity: formData.shippingCity,
                shippingDistrict: formData.shippingDistrict,
                shippingPostalCode: formData.shippingPostalCode,
                shippingPhone: formData.shippingPhone,
                notes: formData.notes,
            });

            const orderNumber = response.data?.orderNumber || response.orderNumber;
            router.push(`/orders/${orderNumber}/success`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sipariş oluşturulamadı';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Sipariş Tamamla</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                            {/* Kayıtlı Adresler */}
                            {addresses.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-3">Kayıtlı Adreslerim</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                onClick={() => selectAddress(address)}
                                                className={`p-4 border rounded-lg cursor-pointer transition ${
                                                    selectedAddressId === address.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'hover:border-gray-400'
                                                }`}
                                            >
                                                <p className="font-medium">{address.title}</p>
                                                <p className="text-gray-600 text-sm">{address.address}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {address.district}/{address.city}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-2">
                                        veya aşağıya yeni adres girin
                                    </p>
                                </div>
                            )}

                            <h2 className="text-xl font-bold mb-4">Teslimat Bilgileri</h2>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Adres</label>
                                <textarea
                                    name="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">İl</label>
                                    <input
                                        type="text"
                                        name="shippingCity"
                                        value={formData.shippingCity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">İlçe</label>
                                    <input
                                        type="text"
                                        name="shippingDistrict"
                                        value={formData.shippingDistrict}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Posta Kodu</label>
                                    <input
                                        type="text"
                                        name="shippingPostalCode"
                                        value={formData.shippingPostalCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Telefon</label>
                                    <input
                                        type="tel"
                                        name="shippingPhone"
                                        value={formData.shippingPhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="05XX XXX XX XX"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Teslimat Tipi</label>
                                <select
                                    name="deliveryType"
                                    value={formData.deliveryType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="CARGO">Kargo (35 TL)</option>
                                    <option value="COURIER">Kurye (20 TL)</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Sipariş Notu (Opsiyonel)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
                            >
                                {submitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Onayla'}
                            </button>
                        </form>
                    </div>

                    {/* Sipariş Özeti */}
                    {cart && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

                                <div className="space-y-3 mb-4">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.productName} x {item.quantity}
                      </span>
                                            <span>{item.totalPrice.toFixed(2)} TL</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ara Toplam</span>
                                        <span>{cart.subtotal.toFixed(2)} TL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kargo</span>
                                        <span>{formData.deliveryType === 'COURIER' ? '20.00' : '35.00'} TL</span>
                                    </div>
                                </div>

                                <div className="border-t mt-4 pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Toplam</span>
                                        <span className="text-green-600">
                      {(cart.subtotal + (formData.deliveryType === 'COURIER' ? 20 : 35)).toFixed(2)} TL
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}