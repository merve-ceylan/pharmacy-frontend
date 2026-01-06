'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500 mb-4">⚠️</h1>
                <h2 className="text-2xl font-bold text-gray-700">Bir Hata Oluştu</h2>
                <p className="text-gray-500 mt-2">Üzgünüz, beklenmeyen bir hata oluştu.</p>
                <div className="mt-6 flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Tekrar Dene
                    </button>
                    <Link
                        href="/"
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Ana Sayfa
                    </Link>
                </div>
            </div>
        </div>
    );
}