"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Shield, Lock, Server, Eye } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gray-900 text-white py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Shield size={64} className="mx-auto mb-6 text-[#1a9ea3]" />
                        <h1 className="text-4xl md:text-5xl font-light mb-6">Sécurité chez UPJUNOO</h1>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            La protection de vos données et de vos transactions est notre priorité absolue. Découvrez comment nous sécurisons notre écosystème.
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section className="py-20 px-6 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <Lock className="text-[#1a9ea3] mb-4" size={32} />
                            <h3 className="text-xl font-medium text-gray-900 mb-3">Chiffrement de bout en bout</h3>
                            <p className="text-gray-600"> Toutes les données sensibles sont chiffrées en transit et au repos utilisant les standards les plus élevés (AES-256, TLS 1.3).</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <Server className="text-[#1a9ea3] mb-4" size={32} />
                            <h3 className="text-xl font-medium text-gray-900 mb-3">Infrastructure certifiée</h3>
                            <p className="text-gray-600">Nos serveurs sont hébergés dans des datacenters certifiés ISO 27001, garantissant une sécurité physique et logique maximale.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <Eye className="text-[#1a9ea3] mb-4" size={32} />
                            <h3 className="text-xl font-medium text-gray-900 mb-3">Surveillance 24/7</h3>
                            <p className="text-gray-600">Nos équipes de sécurité surveillent nos systèmes en permanence pour détecter et bloquer toute menace potentielle.</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-16 px-6 max-w-4xl mx-auto border-t border-gray-100">
                    <h2 className="text-2xl font-medium text-gray-900 mb-6">Conformité et Standards</h2>
                    <p className="text-gray-600 mb-6">
                        UPJUNOO respecte les réglementations internationales en matière de protection des données et de sécurité financière.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-700">Conformité RGPD / APDP</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-700">PCI DSS pour les paiements</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-700">Audits de sécurité réguliers</span>
                        </li>
                    </ul>
                </section>
            </main>
            <SiteFooter />
        </div>
    );
}
