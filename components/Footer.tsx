import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo ve Açıklama */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏥</span>
                            <span className="text-xl font-bold text-white">Eczanem</span>
                        </Link>
                        <p className="text-sm text-gray-400 mb-4">
                            Online eczane alışverişinde güvenilir adresiniz. Sağlığınız için en iyi ürünleri en uygun fiyatlarla sunuyoruz.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                📘
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                📸
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                🐦
                            </a>
                        </div>
                    </div>

                    {/* Hızlı Linkler */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/products" className="hover:text-white transition">
                                    Ürünler
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-white transition">
                                    Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-white transition">
                                    İletişim
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-white transition">
                                    Sık Sorulan Sorular
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Kategoriler */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Kategoriler</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/products" className="hover:text-white transition">
                                    Ağrı Kesici
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-white transition">
                                    Vitamin & Mineral
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-white transition">
                                    Cilt Bakım
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-white transition">
                                    Anne & Bebek
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">İletişim</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <span>📍</span>
                                <span>Örnek Mahallesi, Eczane Sokak No:1, Kadıköy/İstanbul</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span>
                                <span>0216 123 45 67</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📧</span>
                                <span>info@eczanem.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🕐</span>
                                <span>Her gün 09:00 - 21:00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Alt Footer */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © 2024 Eczanem. Tüm hakları saklıdır.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/privacy" className="hover:text-white transition">
                                Gizlilik Politikası
                            </Link>
                            <Link href="/terms" className="hover:text-white transition">
                                Kullanım Koşulları
                            </Link>
                            <Link href="/kvkk" className="hover:text-white transition">
                                KVKK
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}