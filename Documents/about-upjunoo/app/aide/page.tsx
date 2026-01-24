"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Search, HelpCircle, FileText, MessageCircle, AlertCircle } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SiteHeader />

            <main className="flex-1">
                {/* Hero Search */}
                <section className="bg-[#1a9ea3] py-20 text-center px-6">
                    <h1 className="text-3xl md:text-4xl font-medium text-white mb-6">
                        Comment pouvons-nous vous aider ?
                    </h1>
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                        <input
                            type="text"
                            placeholder="Rechercher dans l'aide..."
                            className="w-full pl-12 pr-4 py-4 rounded-full text-lg focus:outline-none shadow-lg"
                        />
                    </div>
                </section>

                {/* Quick Topics */}
                <section className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-2xl font-light text-gray-900 mb-8">Thèmes populaires</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Premiers pas</h3>
                            <p className="text-gray-600 mb-4 text-sm">Guide de démarrage pour tous les produits UPJUNOO.</p>
                            <a href="#" className="text-[#1a9ea3] font-medium text-sm hover:underline">Voir les articles →</a>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                                <HelpCircle size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Compte & Sécurité</h3>
                            <p className="text-gray-600 mb-4 text-sm">Gérer votre identifiant UPJUNOO et vos paramètres.</p>
                            <a href="#" className="text-[#1a9ea3] font-medium text-sm hover:underline">Voir les articles →</a>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Résolution de problèmes</h3>
                            <p className="text-gray-600 mb-4 text-sm">Solutions aux problèmes techniques courants.</p>
                            <a href="#" className="text-[#1a9ea3] font-medium text-sm hover:underline">Voir les articles →</a>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-white py-16 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-2xl font-light text-center text-gray-900 mb-12">Questions Fréquentes</h2>
                        <div className="space-y-6">
                            {[
                                { q: "Comment créer un compte UPJUNOO ?", a: "Vous pouvez créer un compte gratuitement depuis la page d'inscription. Un seul compte vous donne accès à tous nos services." },
                                { q: "Mes données sont-elles sécurisées ?", a: "Oui, la sécurité et la confidentialité sont au cœur de notre architecture. Nous utilisons un chiffrement de bout en bout." },
                                { q: "Comment contacter le support technique ?", a: "Notre équipe est disponible 24/7 via le chat en direct ou par email à support@upjunoo.com." },
                                { q: "Puis-je utiliser UPJUNOO PRO en tant que particulier ?", a: "Absolument ! UPJUNOO PRO propose des services adaptés aux particuliers pour la mobilité et la livraison." }
                            ].map((item, idx) => (
                                <div key={idx} className="border-b border-gray-100 pb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2 cursor-pointer hover:text-[#1a9ea3] transition-colors">{item.q}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-20 text-center px-6">
                    <h2 className="text-2xl font-light text-gray-900 mb-4">Vous ne trouvez pas la réponse ?</h2>
                    <p className="text-gray-600 mb-8">Nos experts sont là pour vous aider.</p>
                    <a
                        href="https://wa.me/2250505838375"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#1a9ea3] text-white px-8 py-3 rounded-full hover:bg-[#158084] transition-colors font-medium"
                    >
                        <MessageCircle size={20} />
                        Contacter le support sur WhatsApp
                    </a>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
