'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'Sipariş verdikten sonra ne kadar sürede teslim alırım?',
        answer: 'Siparişleriniz genellikle 1-3 iş günü içinde kargoya verilir. Teslimat süresi bulunduğunuz şehre göre 1-5 iş günü arasında değişebilir. Aynı gün kargo seçeneğimiz de mevcuttur.',
    },
    {
        question: 'Ödeme yöntemleri nelerdir?',
        answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz mevcuttur. Tüm ödemeleriniz 256-bit SSL sertifikası ile güvence altındadır.',
    },
    {
        question: 'Reçeteli ilaçları nasıl sipariş edebilirim?',
        answer: 'Reçeteli ilaçlar için öncelikle reçetenizi sistemimize yüklemeniz gerekmektedir. Eczacımız reçetenizi inceledikten sonra siparişiniz onaylanacaktır.',
    },
    {
        question: 'Ürün iade ve değişim politikanız nedir?',
        answer: 'Teslim aldığınız ürünlerde herhangi bir sorun olması durumunda 14 gün içinde iade veya değişim talep edebilirsiniz. İlaç ürünlerinde yasal düzenlemeler gereği iade kabul edilmemektedir.',
    },
    {
        question: 'Kargo ücreti ne kadar?',
        answer: '150 TL ve üzeri alışverişlerinizde kargo ücretsizdir. 150 TL altı siparişlerde 35 TL kargo ücreti uygulanmaktadır. Kurye ile teslimat seçeneğinde ise 20 TL ücret alınmaktadır.',
    },
    {
        question: 'Siparişimi nasıl takip edebilirim?',
        answer: 'Hesabım > Siparişlerim bölümünden tüm siparişlerinizi ve kargo takip numaralarınızı görüntüleyebilirsiniz. Ayrıca sipariş durumu değişikliklerinde e-posta ile bilgilendirilirsiniz.',
    },
    {
        question: 'Ürünler orijinal mi?',
        answer: 'Evet, tüm ürünlerimiz yetkili distribütörlerden temin edilmekte olup %100 orijinal ve garantilidir. Sağlık Bakanlığı onaylı ürünler satışa sunulmaktadır.',
    },
    {
        question: 'Üyelik zorunlu mu?',
        answer: 'Sipariş verebilmek için üye olmanız gerekmektedir. Üyelik ücretsizdir ve sadece birkaç dakikanızı alır. Üye olarak siparişlerinizi takip edebilir, favori ürünlerinizi kaydedebilirsiniz.',
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-2">Sık Sorulan Sorular</h1>
                <p className="text-gray-600 text-center mb-8">
                    Merak ettiklerinize hızlıca cevap bulun
                </p>

                <div className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                            >
                                <span className="font-medium">{faq.question}</span>
                                <span className="text-2xl text-gray-400">
                  {openIndex === index ? '−' : '+'}
                </span>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4">
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">Sorunuza cevap bulamadınız mı?</p>
                    <Link
                        href="/contact"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-block"
                    >
                        Bize Ulaşın
                    </Link>
                </div>
            </div>
        </div>
    );
}