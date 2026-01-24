"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eye, Volume2, MousePointer, Smartphone } from "lucide-react";

export default function AccessibilityPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />

            <main className="flex-1">
                <section className="bg-gray-50 py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
                            L'accessibilité pour tous
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            Chez UPJUNOO, nous construisons des produits utilisables par le plus grand nombre, quelles que soient leurs capacités.
                        </p>
                    </div>
                </section>

                <section className="py-20 px-6 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-light text-gray-900 mb-6">Notre engagement</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Nous nous engageons à respecter les normes internationales d'accessibilité (WCAG) pour garantir que notre écosystème digital soit inclusif.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Chaque nouvelle fonctionnalité est testée pour assurer sa compatibilité avec les technologies d'assistance et offrir une expérience fluide à tous nos utilisateurs.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                <Eye size={32} className="text-[#1a9ea3] mx-auto mb-4" />
                                <h3 className="font-medium text-gray-900 mb-2">Visuel</h3>
                                <p className="text-sm text-gray-600">Contraste élevé & support lecteur d'écran</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                <Volume2 size={32} className="text-[#1a9ea3] mx-auto mb-4" />
                                <h3 className="font-medium text-gray-900 mb-2">Auditif</h3>
                                <p className="text-sm text-gray-600">Sous-titres & contenus adaptés</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                <MousePointer size={32} className="text-[#1a9ea3] mx-auto mb-4" />
                                <h3 className="font-medium text-gray-900 mb-2">Moteur</h3>
                                <p className="text-sm text-gray-600">Navigation clavier complète</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                <Smartphone size={32} className="text-[#1a9ea3] mx-auto mb-4" />
                                <h3 className="font-medium text-gray-900 mb-2">Cognitif</h3>
                                <p className="text-sm text-gray-600">Interface claire & simplifiée</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#1a9ea3] py-16 px-6 text-white text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-medium mb-4">Signaler un problème d'accessibilité</h2>
                        <p className="mb-8 opacity-90">
                            Si vous rencontrez des difficultés pour accéder à nos contenus ou services, n'hésitez pas à nous contacter. Nous traiterons votre demande en priorité.
                        </p>
                        <a href="mailto:contact@upjunoo.com" className="bg-white text-[#1a9ea3] px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                            Contacter l'équipe Accessibilité
                        </a>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
