import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero */}
            <section className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Sağlığınız için en iyi hizmeti sunmak bizim önceliğimiz
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4">Biz Kimiz?</h2>
                            <p className="text-gray-600 mb-4">
                                Eczanem, 2024 yılında Türkiye&apos;nin önde gelen online eczane platformu olarak kurulmuştur.
                                Amacımız, müşterilerimize en kaliteli ilaç ve sağlık ürünlerini en uygun fiyatlarla
                                ve en hızlı şekilde ulaştırmaktır.
                            </p>
                            <p className="text-gray-600">
                                Deneyimli eczacı kadromuz ve modern altyapımız ile 7/24 hizmet vermekteyiz.
                                Müşteri memnuniyeti bizim için her şeyden önemlidir.
                            </p>
                        </div>

                        {/* Values */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <span className="text-4xl mb-4 block">🎯</span>
                                <h3 className="text-lg font-bold mb-2">Misyonumuz</h3>
                                <p className="text-gray-600 text-sm">
                                    Sağlık ürünlerine erişimi kolaylaştırmak ve herkesin kaliteli hizmete
                                    ulaşmasını sağlamak.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <span className="text-4xl mb-4 block">👁️</span>
                                <h3 className="text-lg font-bold mb-2">Vizyonumuz</h3>
                                <p className="text-gray-600 text-sm">
                                    Türkiye&apos;nin en güvenilir ve en çok tercih edilen online eczane platformu olmak.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <span className="text-4xl mb-4 block">💎</span>
                                <h3 className="text-lg font-bold mb-2">Değerlerimiz</h3>
                                <p className="text-gray-600 text-sm">
                                    Güvenilirlik, şeffaflık, müşteri odaklılık ve sürekli gelişim.
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h2 className="text-2xl font-bold mb-6 text-center">Rakamlarla Biz</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">10K+</p>
                                    <p className="text-gray-600">Mutlu Müşteri</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">5K+</p>
                                    <p className="text-gray-600">Ürün Çeşidi</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">50+</p>
                                    <p className="text-gray-600">İl&apos;e Teslimat</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-600">24/7</p>
                                    <p className="text-gray-600">Müşteri Desteği</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gray-200 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Sorularınız mı var?</h2>
                    <p className="text-gray-600 mb-6">
                        Bizimle iletişime geçmekten çekinmeyin, size yardımcı olmaktan mutluluk duyarız.
                    </p>
                    <Link
                        href="/contact"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
                    >
                        İletişime Geç
                    </Link>
                </div>
            </section>
        </div>
    );
}