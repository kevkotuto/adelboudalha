"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />
            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-light text-gray-900 mb-8">Politique des Cookies</h1>
                <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-600 mb-6">Nous utilisons des cookies pour améliorer votre expérience.</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">Qu'est-ce qu'un cookie ?</h2>
                        <p className="text-gray-600 mb-4">
                            Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette ou mobile) lors de la visite d'un site web.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">Types de cookies utilisés</h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-4 mb-4">
                            <li>
                                <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (ex: connexion, panier).
                            </li>
                            <li>
                                <strong>Cookies analytiques :</strong> Nous aident à comprendre l'utilisation du site pour l'améliorer.
                            </li>
                            <li>
                                <strong>Cookies de préférences :</strong> Permettent de mémoriser vos choix (ex: langue).
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-medium text-gray-900 mb-4">Gestion des cookies</h2>
                        <p className="text-gray-600">
                            Vous pouvez à tout moment configurer votre navigateur pour refuser ou supprimer les cookies. Notez cependant que cela pourrait altérer certaines fonctionnalités du site.
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
