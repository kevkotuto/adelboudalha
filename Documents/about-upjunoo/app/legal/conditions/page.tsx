"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />
            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-light text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
                <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-600 mb-6">En vigueur au : 27 Décembre 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">1. Acceptation des conditions</h2>
                        <p className="text-gray-600 mb-4">
                            En accédant et en utilisant les services UPJUNOO, vous acceptez d'être lié par les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">2. Description des services</h2>
                        <p className="text-gray-600 mb-4">
                            UPJUNOO fournit une plateforme intégrée offrant des services de mobilité, de commerce, de paiement et de données. Nous nous réservons le droit de modifier ou d'interrompre ces services à tout moment.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">3. Compte utilisateur</h2>
                        <p className="text-gray-600 mb-4">
                            Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe. Toute activité effectuée sous votre compte relève de votre responsabilité.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">4. Propriété intellectuelle</h2>
                        <p className="text-gray-600">
                            Tous les contenus présents sur la plateforme (logos, textes, images, logiciels) sont la propriété exclusive d'UPJUNOO et sont protégés par le droit de la propriété intellectuelle.
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
