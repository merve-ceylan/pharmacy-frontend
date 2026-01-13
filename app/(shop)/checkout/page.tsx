'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cartApi, ordersApi } from '@/lib/api';
import { Cart } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import ButtonSpinner from '@/components/ButtonSpinner';

interface Address {
    id: number;
    title: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [step, setStep] = useState(1); // 1: Adres, 2: Ödeme

    const [formData, setFormData] = useState({
        shippingAddress: '',
        shippingCity: '',
        shippingDistrict: '',
        shippingPostalCode: '',
        shippingPhone: '',
        shippingFullName: '',
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
                showError('Sepetiniz boş');
                router.push('/cart');
                return;
            }
            setCart(cartData);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sepet yüklenemedi';
            setError(errorMessage);
            showError(errorMessage);
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
            shippingAddress: address.addressLine,
            shippingCity: address.city,
            shippingDistrict: address.district,
            shippingPostalCode: address.postalCode || '',
            shippingPhone: address.phone,
            shippingFullName: address.fullName,
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep1 = () => {
        if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingDistrict || !formData.shippingPhone) {
            showError('Lütfen tüm adres bilgilerini doldurun');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
            window.scrollTo(0, 0);
        }
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
            showSuccess('Siparişiniz başarıyla oluşturuldu! 🎉');
            router.push(`/orders/${orderNumber}/success`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Sipariş oluşturulamadı';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const shippingCost = formData.deliveryType === 'COURIER' ? 20 : 35;
    const totalAmount = cart ? cart.subtotal + shippingCost : 0;

    // Skeleton Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <Skeleton width="250px" height="36px" className="mb-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <Skeleton width="200px" height="28px" className="mb-6" />
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <Skeleton height="100px" variant="rectangular" />
                                    <Skeleton height="100px" variant="rectangular" />
                                </div>
                                <Skeleton height="80px" variant="rectangular" className="mb-4" />
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <Skeleton height="60px" variant="rectangular" />
                                    <Skeleton height="60px" variant="rectangular" />
                                </div>
                                <Skeleton height="50px" variant="rectangular" />
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <Skeleton width="150px" height="28px" className="mb-4" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} height="24px" />
                                    ))}
                                </div>
                                <Skeleton height="60px" variant="rectangular" className="mt-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm flex items-center gap-2">
                    <Link href="/cart" className="text-gray-500 hover:text-blue-600 transition">
                        🛒 Sepet
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-700 font-medium">Sipariş Tamamla</span>
                </nav>

                {/* Stepper */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            1
                        </div>
                        <span className={`ml-2 font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Teslimat
            </span>
                    </div>
                    <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            2
                        </div>
                        <span className={`ml-2 font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Ödeme
            </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Teslimat Bilgileri */}
                            {step === 1 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span>📍</span>
                                        <span>Teslimat Adresi</span>
                                    </h2>

                                    {/* Kayıtlı Adresler */}
                                    {addresses.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-gray-700 font-medium mb-3">Kayıtlı Adreslerim</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {addresses.map((address) => (
                                                    <div
                                                        key={address.id}
                                                        onClick={() => selectAddress(address)}
                                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                            selectedAddressId === address.id
                                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold">{address.title}</span>
                                                            {address.isDefault && (
                                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                  Varsayılan
                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-sm">{address.fullName}</p>
                                                        <p className="text-gray-500 text-sm">{address.addressLine}</p>
                                                        <p className="text-gray-500 text-sm">
                                                            {address.district}/{address.city}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex-1 border-t border-gray-200"></div>
                                                <span className="text-gray-400 text-sm">veya yeni adres girin</span>
                                                <div className="flex-1 border-t border-gray-200"></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Yeni Adres Formu */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium">
                                                Adres <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="shippingAddress"
                                                value={formData.shippingAddress}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                                rows={2}
                                                placeholder="Mahalle, sokak, bina no, daire no"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">
                                                    İl <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="shippingCity"
                                                    value={formData.shippingCity}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                                    placeholder="İstanbul"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">
                                                    İlçe <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="shippingDistrict"
                                                    value={formData.shippingDistrict}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                                    placeholder="Kadıköy"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">Posta Kodu</label>
                                                <input
                                                    type="text"
                                                    name="shippingPostalCode"
                                                    value={formData.shippingPostalCode}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                                    placeholder="34700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2 font-medium">
                                                    Telefon <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="shippingPhone"
                                                    value={formData.shippingPhone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                                    placeholder="05XX XXX XX XX"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-2 font-medium">
                                                🚚 Teslimat Tipi
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label
                                                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                        formData.deliveryType === 'CARGO'
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="deliveryType"
                                                        value="CARGO"
                                                        checked={formData.deliveryType === 'CARGO'}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-blue-600"
                                                    />
                                                    <div>
                                                        <span className="font-medium">Kargo</span>
                                                        <p className="text-sm text-gray-500">2-3 iş günü • 35 TL</p>
                                                    </div>
                                                </label>
                                                <label
                                                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                        formData.deliveryType === 'COURIER'
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="deliveryType"
                                                        value="COURIER"
                                                        checked={formData.deliveryType === 'COURIER'}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-blue-600"
                                                    />
                                                    <div>
                                                        <span className="font-medium">Kurye</span>
                                                        <p className="text-sm text-gray-500">Aynı gün • 20 TL</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
                                    >
                                        <span>Devam Et</span>
                                        <span>→</span>
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Ödeme */}
                            {step === 2 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span>💳</span>
                                        <span>Ödeme Bilgileri</span>
                                    </h2>

                                    {/* Teslimat Özeti */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-700">Teslimat Adresi</span>
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Düzenle
                                            </button>
                                        </div>
                                        <p className="text-gray-600 text-sm">{formData.shippingAddress}</p>
                                        <p className="text-gray-600 text-sm">
                                            {formData.shippingDistrict}/{formData.shippingCity} {formData.shippingPostalCode}
                                        </p>
                                        <p className="text-gray-600 text-sm">📞 {formData.shippingPhone}</p>
                                    </div>

                                    {/* Ödeme Yöntemi (Kapıda Ödeme) */}
                                    <div className="mb-6">
                                        <label className="block text-gray-700 mb-3 font-medium">Ödeme Yöntemi</label>
                                        <div className="border-2 border-blue-500 bg-blue-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">💵</span>
                                                <div>
                                                    <span className="font-medium">Kapıda Ödeme</span>
                                                    <p className="text-sm text-gray-500">Nakit veya Kredi Kartı</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">
                                            * Online ödeme yakında eklenecektir
                                        </p>
                                    </div>

                                    {/* Sipariş Notu */}
                                    <div className="mb-6">
                                        <label className="block text-gray-700 mb-2 font-medium">
                                            📝 Sipariş Notu (Opsiyonel)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                            rows={2}
                                            placeholder="Siparişinizle ilgili eklemek istediğiniz notlar..."
                                        />
                                    </div>

                                    {/* Butonlar */}
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                        >
                                            ← Geri
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-all font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg"
                                        >
                                            {submitting ? (
                                                <>
                                                    <ButtonSpinner />
                                                    <span>Sipariş Oluşturuluyor...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>✓</span>
                                                    <span>Siparişi Onayla ({totalAmount.toFixed(2)} TL)</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Sipariş Özeti */}
                    {cart && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span>🛒</span>
                                    <span>Sipariş Özeti</span>
                                </h2>

                                {/* Ürünler */}
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                                                💊
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.productName}</p>
                                                <p className="text-gray-500 text-xs">{item.quantity} adet</p>
                                            </div>
                                            <span className="font-medium text-sm">{item.totalPrice.toFixed(2)} TL</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Toplam */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Ara Toplam</span>
                                        <span>{cart.subtotal.toFixed(2)} TL</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Kargo ({formData.deliveryType === 'COURIER' ? 'Kurye' : 'Standart'})
                    </span>
                                        <span>{shippingCost.toFixed(2)} TL</span>
                                    </div>
                                </div>

                                <div className="border-t mt-4 pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Toplam</span>
                                        <span className="text-green-600">{totalAmount.toFixed(2)} TL</span>
                                    </div>
                                </div>

                                {/* Güvence */}
                                <div className="mt-6 pt-4 border-t space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span>🔒</span>
                                        <span>Güvenli alışveriş</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>↩️</span>
                                        <span>14 gün koşulsuz iade</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📞</span>
                                        <span>7/24 müşteri desteği</span>
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