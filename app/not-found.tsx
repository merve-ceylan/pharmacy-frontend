import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-300">404</h1>
                <h2 className="text-2xl font-bold text-gray-700 mt-4">Sayfa Bulunamadı</h2>
                <p className="text-gray-500 mt-2">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                <div className="mt-6 flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Ana Sayfa
                    </Link>
                    <Link
                        href="/products"
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Ürünler
                    </Link>
                </div>
            </div>
        </div>
    );
}