'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
    const params = useParams();
    const orderNumber = params.orderNumber as string;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-green-600 mb-2">
                    Siparişiniz Alındı!
                </h1>
                <p className="text-gray-600 mb-4">
                    Sipariş numaranız: <strong>{orderNumber}</strong>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                    Siparişiniz onaylandığında e-posta ile bilgilendirileceksiniz.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/orders"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Siparişlerim
                    </Link>
                    <Link
                        href="/products"
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Alışverişe Devam
                    </Link>
                </div>
            </div>
        </div>
    );
}