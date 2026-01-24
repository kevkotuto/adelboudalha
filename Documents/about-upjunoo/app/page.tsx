"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X, ExternalLink } from "lucide-react";
import { ProductCardsSection } from "@/components/product-cards-section";
import { SiteFooter } from "@/components/site-footer";

// Types de produits UPJUNOO
interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconPath: string;
  color: string;
  gradient: string;
  features: string[];
  pdfUrl?: string;
  category: "mobilite" | "commerce" | "paiements" | "data" | "services";
}

const products: Product[] = [
  {
    id: "upjunoo",
    name: "UPJUNOO",
    subtitle: "Services digitaux",
    description: "Un portail digital international qui réunit moteur de recherche IA, messagerie moderne, cloud, événements, jeux et outils collaboratifs dans un seul univers.",
    iconPath: "/iconUpjunoo/layers.svg",
    color: "#1a9ea3",
    gradient: "from-[#1a9ea3] to-[#158084]",
    features: [
      "Moteur de recherche multithème dopé à l'IA",
      "Messagerie e-mail & tchats instantanés",
      "Cloud & stockage sécurisé",
      "Agendas & billetterie événements",
      "Jeux & divertissement",
      "Outils collaboratifs & productivité"
    ],
    pdfUrl: "/pdf/FICHE UPJUNOO.pdf",
    category: "services"
  },
  {
    id: "upjunoo-pro",
    name: "UPJUNOO PRO",
    subtitle: "Mobilité & Logistique",
    description: "Plateforme unifiée pour VTC/Taxi, livraison express, location de véhicules et frêt urbain. Une mobilité intelligente, simple et inclusive.",
    iconPath: "/iconUpjunoo/trajet.svg",
    color: "#ea580c",
    gradient: "from-orange-500 to-red-600",
    features: [
      "Transport urbain & interurbain (VTC/Taxi)",
      "Livraison express (colis, repas, documents)",
      "Location de véhicules (particuliers & entreprises)",
      "Frêt urbain & péri-urbain",
      "Suivi GPS en temps réel",
      "Modèle économique inclusif"
    ],
    pdfUrl: "/pdf/Fiches UPJUNOO PRO.pdf",
    category: "mobilite"
  },
  {
    id: "upmarchand",
    name: "UPMARCHAND",
    subtitle: "Marketplace digitale",
    description: "La marketplace qui connecte consommateurs, commerçants et marques. Achetez, vendez et développez votre activité en toute confiance.",
    iconPath: "/iconUpjunoo/shopping.svg",
    color: "#059669",
    gradient: "from-emerald-500 to-teal-600",
    features: [
      "E-commerce multicanal (B2C & B2B)",
      "Paiements sécurisés (Mobile Money, cartes)",
      "Livraison intégrée via UPJUNOO PRO",
      "Publicité & produits sponsorisés",
      "Programmes de fidélisation",
      "Vérification des vendeurs (KYC/KYB)"
    ],
    pdfUrl: "/pdf/13 Fiches UPMARCHAND.pdf",
    category: "commerce"
  },
  {
    id: "uppay",
    name: "UPPAY",
    subtitle: "Paiements & Fintech",
    description: "Solution simple pour encaisser et payer partout. Regroupez tous vos paiements sur une seule plateforme adaptée au terrain.",
    iconPath: "/iconUpjunoo/ads-tool.svg",
    color: "#2563eb",
    gradient: "from-blue-500 to-indigo-600",
    features: [
      "Encaissement multicanal (Mobile Money, cartes, virements)",
      "QR code & liens de paiement",
      "Pilotage & tableau de bord temps réel",
      "Paiements récurrents & de masse",
      "API pour intégration facile",
      "Sécurité & conformité financière"
    ],
    pdfUrl: "/pdf/FICHE UPPAY.pdf",
    category: "paiements"
  },
  {
    id: "upmaps",
    name: "UPMAPS",
    subtitle: "Cartographie & Navigation",
    description: "Plateforme de cartographie et d'analytique géospatiale avec navigation, trafic temps réel et mappings métiers intelligents.",
    iconPath: "/iconUpjunoo/directions.svg",
    color: "#9333ea",
    gradient: "from-purple-500 to-pink-600",
    features: [
      "Navigation & itinéraires optimisés",
      "Trafic temps réel & prévisions",
      "Recherche géolocalisée (POI)",
      "Business & Data mappings",
      "Analyse des flux de mobilité",
      "API & SDK pour intégration"
    ],
    pdfUrl: "/pdf/13 Fiches UPMAPS.pdf",
    category: "mobilite"
  },
  {
    id: "uptrafic",
    name: "UPTRAFIC",
    subtitle: "Données routières & Intelligence de mobilité",
    description: "Analyse des flux, prévisions de trafic et planification urbaine. Une source de données essentielle pour la mobilité intelligente.",
    iconPath: "/iconUpjunoo/data-tool.svg",
    color: "#ca8a04",
    gradient: "from-yellow-500 to-orange-500",
    features: [
      "Données de trafic en temps réel",
      "Prévisions & analyse prédictive",
      "Planification urbaine & transport",
      "Heatmaps & corridors logistiques",
      "KPI de ponctualité",
      "API d'intégration"
    ],
    pdfUrl: "/pdf/Fiches UPTRAFFIC.pdf",
    category: "data"
  },
  {
    id: "updemographic",
    name: "UPDEMOGRAPHIC",
    subtitle: "Données population & territoires",
    description: "Données démographiques et socio-économiques harmonisées, géocodées et exploitables pour sécuriser vos décisions.",
    iconPath: "/iconUpjunoo/demog-tool.svg",
    color: "#0891b2",
    gradient: "from-cyan-500 to-blue-600",
    features: [
      "Population, densité, structure par âge/genre",
      "Indicateurs socio-économiques",
      "Mailles multiples (pays, région, commune)",
      "Enrichissement de vos bases",
      "Visual Analytics & cartes interactives",
      "API & Data Packs (CSV, GeoJSON)"
    ],
    pdfUrl: "/pdf/Fiches UPDEMOGRAPHIC.pdf",
    category: "data"
  },
  {
    id: "updata",
    name: "UPDATA",
    subtitle: "Data Engineering & BI",
    description: "Transformez vos données en leviers de décision : ingestion, gouvernance, BI/visualisation, Data Science & IA.",
    iconPath: "/iconUpjunoo/data-tool.svg",
    color: "#7c3aed",
    gradient: "from-indigo-500 to-purple-600",
    features: [
      "Data Engineering & intégration",
      "Gouvernance & qualité des données",
      "BI & tableaux de bord actionnables",
      "Data Science & IA (prévisions, RAG/LLM)",
      "Géo-analytics & cartes thématiques",
      "Architecture Cloud/On-prem sécurisée"
    ],
    pdfUrl: "/pdf/Fiches UPDATA.pdf",
    category: "data"
  },
  {
    id: "upinsight-api",
    name: "UPINSIGHT API",
    subtitle: "L'intelligence de vos données, partout",
    description: "Votre porte d'entrée unique pour connecter les données et services UPJUNOO à vos applications et processus opérationnels.",
    iconPath: "/iconUpjunoo/translate-tool.svg",
    color: "#db2777",
    gradient: "from-pink-500 to-rose-600",
    features: [
      "Catalogue d'API unifié (mobilité, territoires, analytics)",
      "SDK & connecteurs BI (Power BI, Tableau)",
      "Environnements Sandbox & Production",
      "Sécurité & gouvernance (RBAC, chiffrement)",
      "Webhooks & automatisation",
      "Support d'intégration & documentation"
    ],
    pdfUrl: "/pdf/Fiches UPINSIGHT API.pdf",
    category: "data"
  }
];

const categories = [
  { id: "all", name: "Tous", color: "#666" },
  { id: "services", name: "Services", color: "#1a9ea3" },
  { id: "mobilite", name: "Mobilité", color: "#ea580c" },
  { id: "commerce", name: "Commerce", color: "#059669" },
  { id: "paiements", name: "Paiements", color: "#2563eb" },
  { id: "data", name: "Data", color: "#7c3aed" }
];

const sliderProducts = Array(12).fill(products).flat();

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Image
                src="/logo.png"
                alt="UPJUNOO"
                width={240}
                height={64}
                className="h-16 w-auto"
              />

              {/* Navigation Desktop */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/a-propos" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">À propos</Link>
                <a href="#" className="text-sm text-[#1a9ea3] font-medium">Produits</a>
                <Link href="/services-pro" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Services Professionnels</Link>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Entreprise</a>
                <a href="https://upjunoo.com/actualites" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Actualités</a>
              </nav>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="px-6 py-4 space-y-4">
              <Link href="/a-propos" className="block text-sm text-gray-600 hover:text-gray-900">À propos</Link>
              <a href="#" className="block text-sm text-[#1a9ea3] font-medium">Produits</a>
              <Link href="/services-pro" className="block text-sm text-gray-600 hover:text-gray-900">Services Professionnels</Link>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Entreprise</a>
              <a href="https://upjunoo.com/actualites" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-600 hover:text-gray-900">Actualités</a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section with Sliding Products */}
        <section className="py-20 text-center bg-gray-50 overflow-hidden">
          {/* Sliding Icons */}
          <div className="mb-12">
            <div className="flex animate-scroll gap-8 whitespace-nowrap hover:paused">
              {/* Infinite scroll loop - duplicated 12 times for seamless experience on all screens */}
              {sliderProducts.map((product, index) => (
                <button
                  key={`${product.id}-${index}`}
                  className="shrink-0 focus:outline-none cursor-pointer group"
                  onClick={() => document.getElementById(product.id)?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={product.iconPath}
                      alt={`${product.name} icon`}
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Solutions intelligentes, construites avec vous à l'esprit
            </h1>
            {/* <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Découvrez notre écosystème complet de solutions interconnectées qui transforment
              la mobilité, le commerce, les paiements et les données.
            </p> */}
            <button
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-8 py-4 bg-[#1a9ea3] text-white rounded-full font-medium hover:bg-[#158084] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Découvrir nos produits
            </button>
          </div>
        </section>

        <ProductCardsSection />

        {/* Featured Product Sections */}
        <div className="bg-white">
          {/* UPJUNOO - Services digitaux */}
          <section id="upjunoo" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: "#1a9ea3" }}
                    >
                      <Image
                        src="/iconUpjunoo/layers.svg"
                        alt="UPJUNOO icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPJUNOO</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    Un portail digital international nouvelle génération
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Réunit moteur de recherche IA, messagerie moderne, cloud, événements, jeux et outils collaboratifs
                    dans un seul univers connecté. L'avenir du digital commence ici.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1a9ea3]"></div>
                      <span className="text-gray-700">Moteur de recherche IA multiculturel</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1a9ea3]"></div>
                      <span className="text-gray-700">Écosystème collaboratif intégré</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1a9ea3]"></div>
                      <span className="text-gray-700">Cloud & sécurité avancée</span>
                    </div>
                  </div>
                  <a
                    href="/pdf/FICHE UPJUNOO.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#1a9ea3] text-white px-8 py-3 rounded-full hover:bg-[#158084] transition-colors font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-linear-to-br from-[#1a9ea3]/10 to-[#158084]/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { icon: "/iconUpjunoo/chat-tool.svg", label: "Chat" },
                        { icon: "/iconUpjunoo/games.svg", label: "Jeux" },
                        { icon: "/iconUpjunoo/event-tool.svg", label: "Événements" },
                        { icon: "/iconUpjunoo/data-tool.svg", label: "Cloud" },
                        { icon: "/iconUpjunoo/layers.svg", label: "IA" },
                        { icon: "/iconUpjunoo/translate-tool.svg", label: "Outils" }
                      ].map((item, idx) => (
                        <div key={idx} className="text-center group">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                            <Image
                              src={item.icon}
                              alt={item.label}
                              width={24}
                              height={24}
                              className="w-6 h-6"
                            />
                          </div>
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UPJUNOO PRO - Mobilité */}
          <section id="upjunoo-pro" className="py-20 bg-linear-to-br from-orange-50 to-red-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-linear-to-br from-orange-500/10 to-red-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Image
                          src="/iconUpjunoo/trajet.svg"
                          alt="UPJUNOO PRO"
                          width={64}
                          height={64}
                          className="w-16 h-16"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 backdrop-blur rounded-2xl p-4">
                          <span className="text-2xl font-bold text-orange-600">VTC</span>
                          <p className="text-sm text-gray-600">Transport</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur rounded-2xl p-4">
                          <span className="text-2xl font-bold text-orange-600">24/7</span>
                          <p className="text-sm text-gray-600">Livraison</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur rounded-2xl p-4">
                          <span className="text-2xl font-bold text-orange-600">GPS</span>
                          <p className="text-sm text-gray-600">Suivi</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur rounded-2xl p-4">
                          <span className="text-2xl font-bold text-orange-600">ECO</span>
                          <p className="text-sm text-gray-600">Durable</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-orange-500 to-red-600">
                      <Image
                        src="/iconUpjunoo/trajet.svg"
                        alt="UPJUNOO PRO icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPJUNOO PRO</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    La mobilité intelligente et inclusive
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Plateforme unifiée pour VTC/Taxi, livraison express, location de véhicules et frêt urbain.
                    Une solution complète qui transforme la mobilité en Afrique.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-700">Transport urbain & interurbain unifié</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-700">Livraison express multicatégorie</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-700">Économie circulaire et durable</span>
                    </div>
                  </div>
                  <a
                    href="/pdf/Fiches UPJUNOO PRO.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full hover:from-orange-600 hover:to-red-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* UPMARCHAND - Commerce */}
          <section id="upmarchand" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-emerald-500 to-teal-600">
                      <Image
                        src="/iconUpjunoo/shopping.svg"
                        alt="UPMARCHAND icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPMARCHAND</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    La marketplace qui connecte l'Afrique
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Connecte consommateurs, commerçants et marques dans un écosystème sécurisé.
                    Achetez, vendez et développez votre activité en toute confiance.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-emerald-700 mb-2">B2C & B2B</h4>
                      <p className="text-sm text-gray-600">Commerce multicanal intégré</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-emerald-700 mb-2">Paiements</h4>
                      <p className="text-sm text-gray-600">Mobile Money & cartes</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-emerald-700 mb-2">Livraison</h4>
                      <p className="text-sm text-gray-600">Intégration UPJUNOO PRO</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-emerald-700 mb-2">Fidélité</h4>
                      <p className="text-sm text-gray-600">Programmes avancés</p>
                    </div>
                  </div>
                  <a
                    href="/pdf/13 Fiches UPMARCHAND.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-linear-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="flex justify-center space-x-4">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">🛒</span>
                        </div>
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">🚚</span>
                        </div>
                      </div>
                      <div className="text-6xl font-bold text-emerald-500">→</div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-sm font-medium text-gray-700">Transaction Réussie</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UPPAY - Paiements */}
          <section id="uppay" className="py-20 bg-linear-to-br from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-linear-to-br from-blue-500/10 to-indigo-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="text-center space-y-8">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Image
                          src="/iconUpjunoo/ads-tool.svg"
                          alt="UPPAY"
                          width={48}
                          height={48}
                          className="w-12 h-12"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center">
                            <span className="text-lg font-bold text-blue-600">📱</span>
                            <p className="text-xs text-gray-600 mt-1">Mobile Money</p>
                          </div>
                          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center">
                            <span className="text-lg font-bold text-blue-600">💳</span>
                            <p className="text-xs text-gray-600 mt-1">Cartes</p>
                          </div>
                          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center">
                            <span className="text-lg font-bold text-blue-600">🔒</span>
                            <p className="text-xs text-gray-600 mt-1">Sécurisé</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                          <span className="text-2xl font-bold text-green-500">100%</span>
                          <p className="text-sm text-gray-600">Paiements réussis</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600">
                      <Image
                        src="/iconUpjunoo/ads-tool.svg"
                        alt="UPPAY icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPPAY</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    Paiements simplifiés pour l'Afrique
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Solution complète pour encaisser et payer partout. Regroupez tous vos paiements
                    sur une seule plateforme adaptée au terrain africain.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">Encaissement multicanal unifié</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">QR codes & liens de paiement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">Tableau de bord temps réel</span>
                    </div>
                  </div>
                  <a
                    href="/pdf/FICHE UPPAY.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* UPMAPS - Cartographie */}
          <section id="upmaps" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-purple-500 to-pink-600">
                      <Image
                        src="/iconUpjunoo/directions.svg"
                        alt="UPMAPS icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPMAPS</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    Cartographie intelligente nouvelle génération
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Plateforme de cartographie et d'analytique géospatiale avec navigation,
                    trafic temps réel et mappings métiers intelligents.
                  </p>
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-4">
                      <span className="text-2xl">🗺️</span>
                      <div>
                        <h4 className="font-semibold text-purple-700">Navigation optimisée</h4>
                        <p className="text-sm text-gray-600">Itinéraires intelligents en temps réel</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-4">
                      <span className="text-2xl">📊</span>
                      <div>
                        <h4 className="font-semibold text-purple-700">Analytics géospatiales</h4>
                        <p className="text-sm text-gray-600">Données de mobilité avancées</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-4">
                      <span className="text-2xl">🔌</span>
                      <div>
                        <h4 className="font-semibold text-purple-700">API & SDK</h4>
                        <p className="text-sm text-gray-600">Intégration facile pour développeurs</p>
                      </div>
                    </div>
                  </div>
                  <a
                    href="/pdf/13 Fiches UPMAPS.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full hover:from-purple-600 hover:to-pink-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-linear-to-br from-purple-500/10 to-pink-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-white text-2xl">📍</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 bg-purple-200 rounded-full w-24 mx-auto"></div>
                            <div className="h-2 bg-purple-300 rounded-full w-16 mx-auto"></div>
                            <div className="h-2 bg-purple-200 rounded-full w-20 mx-auto"></div>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Navigation Active</p>
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-8 right-8 w-4 h-4 bg-purple-400 rounded-full opacity-60"></div>
                      <div className="absolute bottom-8 left-8 w-3 h-3 bg-pink-400 rounded-full opacity-60"></div>
                      <div className="absolute top-16 left-12 w-2 h-2 bg-purple-300 rounded-full opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UPTRAFIC - Données routières */}
          <section id="uptrafic" className="py-20 bg-linear-to-br from-yellow-50 to-orange-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-linear-to-br from-yellow-500/10 to-orange-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="w-full space-y-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Flux de Trafic en Temps Réel</h4>
                        <div className="space-y-3">
                          <div className="bg-green-100 rounded-full p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Route A</span>
                            <span className="text-lg">🟢</span>
                            <span className="text-sm text-green-600">Fluide</span>
                          </div>
                          <div className="bg-yellow-100 rounded-full p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-yellow-800">Route B</span>
                            <span className="text-lg">🟡</span>
                            <span className="text-sm text-yellow-600">Modéré</span>
                          </div>
                          <div className="bg-red-100 rounded-full p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-red-800">Route C</span>
                            <span className="text-lg">🔴</span>
                            <span className="text-sm text-red-600">Dense</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Prévision IA</span>
                          <span className="text-lg font-bold text-yellow-600">95%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Précision des prédictions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-yellow-500 to-orange-500">
                      <Image
                        src="/iconUpjunoo/trajet.svg"
                        alt="UPTRAFIC icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPTRAFIC</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    Intelligence de mobilité urbaine
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Analyse des flux, prévisions de trafic et planification urbaine.
                    La source de données essentielle pour la mobilité intelligente.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-700">Données trafic temps réel</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-700">Prévisions & analyse prédictive</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-700">Planification urbaine intelligente</span>
                    </div>
                  </div>
                  <a
                    href="/pdf/Fiches UPTRAFFIC.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* UPDEMOGRAPHIC - Données population */}
          <section id="updemographic" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-cyan-500 to-blue-600">
                      <Image
                        src="/iconUpjunoo/demog-tool.svg"
                        alt="UPDEMOGRAPHIC icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPDEMOGRAPHIC</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    Données démographiques intelligentes
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Données démographiques et socio-économiques harmonisées, géocodées
                    et exploitables pour sécuriser vos décisions stratégiques.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="text-center p-4 bg-cyan-50 rounded-2xl">
                      <div className="text-2xl font-bold text-cyan-600 mb-1">54</div>
                      <p className="text-sm text-gray-600">Pays couverts</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-2xl">
                      <div className="text-2xl font-bold text-cyan-600 mb-1">1000+</div>
                      <p className="text-sm text-gray-600">Indicateurs</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-2xl">
                      <div className="text-2xl font-bold text-cyan-600 mb-1">Real-time</div>
                      <p className="text-sm text-gray-600">Mises à jour</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-2xl">
                      <div className="text-2xl font-bold text-cyan-600 mb-1">API</div>
                      <p className="text-sm text-gray-600">Accès direct</p>
                    </div>
                  </div>
                  <a
                    href="/pdf/Fiches UPDEMOGRAPHIC.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-linear-to-br from-cyan-500/10 to-blue-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="text-center space-y-6 w-full">
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "Population", value: "1.3M", icon: "👥" },
                          { label: "Âge médian", value: "24", icon: "📊" },
                          { label: "PIB/hab", value: "$2.1k", icon: "💰" },
                          { label: "Urbain", value: "65%", icon: "🏙️" },
                          { label: "Éducation", value: "78%", icon: "🎓" },
                          { label: "Internet", value: "45%", icon: "📱" }
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-3 shadow-sm">
                            <div className="text-lg mb-1">{stat.icon}</div>
                            <div className="text-sm font-bold text-cyan-600">{stat.value}</div>
                            <div className="text-xs text-gray-600">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UPDATA - Data Engineering */}
          <section id="updata" className="py-20 bg-linear-to-br from-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-linear-to-br from-indigo-500/10 to-purple-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Image
                          src="/iconUpjunoo/data-tool.svg"
                          alt="UPDATA"
                          width={48}
                          height={48}
                          className="w-12 h-12"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
                          <h4 className="font-semibold text-indigo-700 mb-2">Pipeline de Données</h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Ingestion</span>
                            <span className="text-indigo-600">→</span>
                            <span className="text-gray-600">Transform</span>
                            <span className="text-indigo-600">→</span>
                            <span className="text-gray-600">Analytics</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/80 backdrop-blur rounded-xl p-3 text-center">
                            <span className="text-xl font-bold text-indigo-600">BI</span>
                            <p className="text-xs text-gray-600">Tableaux de bord</p>
                          </div>
                          <div className="bg-white/80 backdrop-blur rounded-xl p-3 text-center">
                            <span className="text-xl font-bold text-indigo-600">AI</span>
                            <p className="text-xs text-gray-600">Machine Learning</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600">
                      <Image
                        src="/iconUpjunoo/data-tool.svg"
                        alt="UPDATA icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPDATA</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    Transformez vos données en décisions
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Plateforme complète de Data Engineering & BI : ingestion, gouvernance,
                    visualisation, Data Science & IA pour maximiser la valeur de vos données.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-gray-700">Data Engineering & intégration complète</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-gray-700">BI & tableaux de bord actionnables</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-gray-700">IA & Machine Learning avancé</span>
                    </div>
                  </div>
                  <a
                    href="/pdf/Fiches UPDATA.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* UPINSIGHT API - API Platform */}
          <section id="upinsight-api" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-pink-500 to-rose-600">
                      <Image
                        src="/iconUpjunoo/layers.svg"
                        alt="UPINSIGHT API icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h2 className="text-4xl font-light text-gray-900">UPINSIGHT API</h2>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">
                    L'intelligence de vos données, partout
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Votre porte d'entrée unique pour connecter les données et services UPJUNOO
                    à vos applications et processus opérationnels existants.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="bg-pink-50 rounded-2xl p-4 flex items-start gap-4">
                      <span className="text-2xl">🚀</span>
                      <div>
                        <h4 className="font-semibold text-pink-700 mb-1">Catalogue API unifié</h4>
                        <p className="text-sm text-gray-600">Mobilité, territoires, analytics en un seul endroit</p>
                      </div>
                    </div>
                    <div className="bg-pink-50 rounded-2xl p-4 flex items-start gap-4">
                      <span className="text-2xl">🔗</span>
                      <div>
                        <h4 className="font-semibold text-pink-700 mb-1">SDK & connecteurs</h4>
                        <p className="text-sm text-gray-600">Power BI, Tableau, outils BI populaires</p>
                      </div>
                    </div>
                    <div className="bg-pink-50 rounded-2xl p-4 flex items-start gap-4">
                      <span className="text-2xl">🛡️</span>
                      <div>
                        <h4 className="font-semibold text-pink-700 mb-1">Sécurité & gouvernance</h4>
                        <p className="text-sm text-gray-600">RBAC, chiffrement, audit complet</p>
                      </div>
                    </div>
                  </div>
                  <a
                    href="/pdf/Fiches UPINSIGHT API.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-full hover:from-pink-600 hover:to-rose-700 transition-all font-medium"
                  >
                    En savoir plus
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-linear-to-br from-pink-500/10 to-rose-500/5 rounded-3xl p-8 h-96 flex items-center justify-center">
                    <div className="text-center space-y-6 w-full">
                      <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h4 className="font-semibold text-gray-800 mb-4">API Dashboard</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">/mobility/realtime</span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">200</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">/demographics/data</span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">200</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">/analytics/insights</span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">200</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Uptime</span>
                            <span className="text-lg font-bold text-pink-600">99.9%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Products Title */}
          <section className="py-16 text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Tous Nos Produits
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Découvrez l'ensemble de notre écosystème digital interconnecté
            </p>
          </section>

          {/* Search and Filter */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a9ea3] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto max-w-full no-scrollbar">
                <span className="text-sm text-gray-600 whitespace-nowrap mr-2 sticky left-0 bg-white pl-1 md:static">Filtrer par :</span>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category.id
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : undefined
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section id="products-section" className="pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="p-6">
                    {/* Icon */}
                    <div className="mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: product.color }}
                      >
                        <Image
                          src={product.iconPath}
                          alt={`${product.name} icon`}
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.subtitle}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features (first 2) */}
                    <ul className="mt-4 space-y-1">
                      {product.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0"></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {product.features.length > 2 && (
                        <li className="text-xs text-gray-400">
                          +{product.features.length - 2} autres fonctionnalités
                        </li>
                      )}
                    </ul>

                    {/* CTA */}
                    {product.pdfUrl && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <a
                          href={product.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group/link"
                        >
                          <span>En savoir plus</span>
                          <ExternalLink size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou de filtrage.
                </p>
              </div>
            )}
          </section>

          {/* Stats Section */}
          <section className="py-16 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">9</div>
                <div className="text-sm text-gray-600">Produits</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">100%</div>
                <div className="text-sm text-gray-600">Interopérables</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">Global</div>
                <div className="text-sm text-gray-600">Portée mondiale</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-2">Sécurisé</div>
                <div className="text-sm text-gray-600">100% confidentiel</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}