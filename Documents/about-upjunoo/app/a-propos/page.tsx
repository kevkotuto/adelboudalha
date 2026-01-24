"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X, CheckCircle2, Users, Target, Lightbulb, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-20 text-center bg-gradient-to-br from-[#1a9ea3]/5 to-[#158084]/5">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Connecter le monde autrement
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              UPJUNOO est une plateforme numérique internationale qui révolutionne la façon
              dont nous interagissons avec le monde digital.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Plateforme internationale
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                IA intégrée
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tout-en-un
              </span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-light text-gray-900 mb-6">
                  Notre Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Créer un portail digital international multi-services unifié qui révolutionne
                  l'expérience utilisateur grâce à l'intelligence artificielle et à l'interconnexion
                  de services essentiels.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1a9ea3] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unifier les services digitaux dans un seul écosystème</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1a9ea3] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Intégrer l'intelligence artificielle de manière omniprésente</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1a9ea3] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Offrir une expérience utilisateur exceptionnelle et intuitive</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#1a9ea3]/10 to-[#158084]/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-[#1a9ea3] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="h-16 w-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Vision 2030</h3>
                    <p className="text-gray-600">
                      Devenir la référence mondiale des plateformes digitales unifiées
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Une Plateforme Tout-en-Un
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                UPJUNOO réunit tous les services essentiels dans un seul environnement
                digital interconnecté et intelligent.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1a9ea3] to-[#158084] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/iconUpjunoo/layers.svg"
                    alt="Moteur de recherche"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Moteur de Recherche IA</h3>
                <p className="text-gray-600 text-sm">
                  Recherche intelligente multilingue avec IA avancée pour des résultats pertinents
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/iconUpjunoo/chat-tool.svg"
                    alt="Messagerie"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Messagerie Unifiée</h3>
                <p className="text-gray-600 text-sm">
                  E-mail et chat instantané dans une interface moderne et sécurisée
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/iconUpjunoo/data-tool.svg"
                    alt="Cloud"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Services Cloud</h3>
                <p className="text-gray-600 text-sm">
                  Stockage sécurisé et synchronisation automatique de vos données
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/iconUpjunoo/event-tool.svg"
                    alt="Événements"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Agenda & Événements</h3>
                <p className="text-gray-600 text-sm">
                  Gestion d'événements avec billetterie et outils d'organisation intégrés
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/iconUpjunoo/games.svg"
                    alt="Jeux"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Jeux & Divertissement</h3>
                <p className="text-gray-600 text-sm">
                  Plateforme de jeux et contenus de divertissement pour tous les âges
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="/iconUpjunoo/translate-tool.svg"
                    alt="Outils"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Outils Collaboratifs</h3>
                <p className="text-gray-600 text-sm">
                  Suite d'outils de productivité et de collaboration pour équipes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Public Cible Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Pour Qui ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                UPJUNOO s'adresse à tous ceux qui recherchent une expérience digitale
                moderne et intégrée.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1a9ea3] to-[#158084] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Utilisateurs Individuels</h3>
                <p className="text-gray-600 text-sm">
                  Particuliers recherchant une plateforme tout-en-un pour leurs besoins digitaux
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Entreprises & Marques</h3>
                <p className="text-gray-600 text-sm">
                  Organisations souhaitant optimiser leur présence digitale et leur productivité
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Organisateurs d'Événements</h3>
                <p className="text-gray-600 text-sm">
                  Professionnels de l'événementiel avec des outils de gestion avancés
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Créateurs de Contenus</h3>
                <p className="text-gray-600 text-sm">
                  Créateurs bénéficiant d'outils de publication et de monétisation intégrés
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs Section */}
        <section className="py-20 bg-gradient-to-br from-[#1a9ea3]/5 to-[#158084]/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Les principes qui guident notre vision et notre développement.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1a9ea3] to-[#158084] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Technologie</h3>
                <p className="text-gray-600">
                  Innovation constante et adoption des technologies les plus avancées
                  pour offrir des solutions de pointe.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Intelligence Artificielle</h3>
                <p className="text-gray-600">
                  Intégration native de l'IA dans tous nos services pour une expérience
                  personnalisée et intelligente.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Expérience Utilisateur</h3>
                <p className="text-gray-600">
                  Design centré utilisateur avec une interface intuitive et une
                  navigation fluide pour tous.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#1a9ea3] to-[#158084] text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-light mb-6">
              Rejoignez la Révolution Digitale
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Découvrez dès maintenant comment UPJUNOO peut transformer votre
              expérience digitale quotidienne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="bg-white text-[#1a9ea3] px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  Découvrir nos produits
                </button>
              </Link>
              <a href="mailto:contact@upjunoo.com">
                <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-[#1a9ea3] transition-all">
                  Nous contacter
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}