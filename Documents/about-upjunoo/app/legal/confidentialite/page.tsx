"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />
            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-light text-gray-900 mb-8">Politique de Confidentialité</h1>
                <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-600 mb-6">Dernière mise à jour : 27 Décembre 2024</p>
                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">1. Collecte des données</h2>
                        <p className="text-gray-600 mb-4">
                            Chez UPJUNOO, nous accordons une importance capitale à la protection de vos données personnelles.
                            Nous collectons uniquement les informations nécessaires pour vous fournir nos services, notamment :
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Informations d'identité (Nom, Prénom)</li>
                            <li>Coordonnées (Email, Téléphone)</li>
                            <li>Données de localisation pour les services de mobilité</li>
                            <li>Données de transaction pour les services de paiement</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">2. Utilisation des données</h2>
                        <p className="text-gray-600 mb-4">
                            Vos données sont utilisées pour :
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Assurer le bon fonctionnement de nos services</li>
                            <li>Améliorer votre expérience utilisateur</li>
                            <li>Garantir la sécurité de vos transactions</li>
                            <li>Vous communiquer des informations importantes</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">3. Protection des données</h2>
                        <p className="text-gray-600">
                            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
