"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { HomepageHeader } from "@/components/homepage-header";
import { HeroBanner } from "@/components/banners";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  // Icônes utilisées pour les sections (non-produits) - à garder
  Globe,
  Truck,
  ShoppingCart,
  CreditCard,
  Map,
  BarChart3,
  Users,
  Database,
  Code,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Building2,
  Car,
  Briefcase,
  Target,
  Lightbulb,
  // Anciennes icônes produits (gardées en commentaire pour référence future)
  // Globe pour UPJUNOO
  // Truck pour UPJUNOO PRO
  // ShoppingCart pour UPMARCHAND
  // CreditCard pour UPPAY
  // Map pour UPMAPS
  // Car pour UPTRAFIC
  // Users pour UPDEMOGRAPHIC
  // Database pour UPDATA
  // Code pour UPINSIGHT API
} from "lucide-react";
import Link from "next/link";

// Types de produits
interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconPath: string; // Chemin vers l'icône SVG dans public/iconUpjunoo
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
    color: "text-[#1a9ea3]",
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
    color: "text-orange-600",
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
    color: "text-emerald-600",
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
    color: "text-blue-600",
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
    color: "text-purple-600",
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
    iconPath: "/iconUpjunoo/trajet.svg",
    color: "text-yellow-600",
    gradient: "from-yellow-500 to-orange-500",
    features: [
      "Données de trafic en temps réel",
      "Prévisions & analyse prédictive",
      "Planification urbaine & transport",
      "Heatmaps & corridors logistiques",
      "KPI de ponctualité",
      "API d'intégration"
    ],
    category: "data"
  },
  {
    id: "updemographic",
    name: "UPDEMOGRAPHIC",
    subtitle: "Données population & territoires",
    description: "Données démographiques et socio-économiques harmonisées, géocodées et exploitables pour sécuriser vos décisions.",
    iconPath: "/iconUpjunoo/demog-tool.svg",
    color: "text-cyan-600",
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
    color: "text-indigo-600",
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
    iconPath: "/iconUpjunoo/layers.svg",
    color: "text-pink-600",
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
  { id: "all", name: "Tous les produits", icon: <Sparkles className="h-4 w-4" /> },
  { id: "mobilite", name: "Mobilité", icon: <Truck className="h-4 w-4" /> },
  { id: "commerce", name: "Commerce", icon: <ShoppingCart className="h-4 w-4" /> },
  { id: "paiements", name: "Paiements", icon: <CreditCard className="h-4 w-4" /> },
  { id: "data", name: "Data & Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "services", name: "Services", icon: <Globe className="h-4 w-4" /> }
];

export default function ProduitsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <HomepageHeader />

      <main className="container mx-auto px-4 pb-12 max-w-7xl">
        {/* Hero Section */}
        <div className="mt-4 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a9ea3] via-[#158084] to-[#106b6e] p-8 md:p-12 text-white">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <Badge className="bg-white/20 text-white border-0 mb-4 backdrop-blur-sm">
                Écosystème UPJUNOO
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Nos Produits
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-6">
                Une plateforme globale. Un monde connecté. Des milliards de possibilités.
              </p>
              <p className="text-lg text-white/80 max-w-2xl">
                Découvrez notre écosystème complet de solutions interconnectées au service de la mobilité,
                du commerce, des paiements, de la donnée et des services numériques.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-3xl font-bold mb-1">9</div>
                  <div className="text-sm text-white/80">Produits</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-white/80">Interopérables</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-3xl font-bold mb-1">Global</div>
                  <div className="text-sm text-white/80">Portée mondiale</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-3xl font-bold mb-1">
                    <Shield className="h-6 w-6" />
                    <span>100%</span>
                  </div>
                  <div className="text-sm text-white/80">Sécurisé</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bannière publicitaire */}
        <div className="mb-8">
          <HeroBanner position="HOMEPAGE_HERO" />
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-[#1a9ea3] text-white shadow-lg shadow-[#1a9ea3]/30"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              className="border-0 bg-white dark:bg-zinc-900 hover:shadow-2xl hover:shadow-[#1a9ea3]/10 transition-all duration-500 group overflow-hidden animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, animationFillMode: "both" }}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${product.gradient} text-white group-hover:scale-110 transition-transform duration-500`}>
                    <Image
                      src={product.iconPath}
                      alt={`${product.name} icon`}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <Badge className={`${product.color} bg-transparent border border-current`}>
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                  {product.name}
                </h3>
                <p className={`text-sm font-semibold ${product.color} mb-3`}>
                  {product.subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className={`h-4 w-4 ${product.color} flex-shrink-0 mt-0.5`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {product.features.length > 3 && (
                    <p className="text-xs text-zinc-400 pl-6">
                      +{product.features.length - 3} autres fonctionnalités
                    </p>
                  )}
                </div>

                {/* CTA */}
                {product.pdfUrl && (
                  <Link href={product.pdfUrl} target="_blank">
                    <Button className={`w-full bg-gradient-to-r ${product.gradient} text-white hover:opacity-90 transition-opacity group/btn`}>
                      <span>En savoir plus</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expertise Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <Badge className="bg-gradient-to-r from-[#1a9ea3] to-[#158084] text-white border-0 mb-4">
              Notre Expertise
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              UPJUNOO ! – Expertise opérationnelle et vision stratégique
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
              Transformer durablement les systèmes de transport et de logistique en Afrique
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 - Au-delà de la mise en relation */}
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                      Au-delà de la mise en relation
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      UPJUNOO propose une offre de services professionnels destinée aux collectivités,
                      aux opérateurs privés et aux investisseurs pour accompagner la transformation
                      digitale de la mobilité.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold mt-6">
                  <Lightbulb className="h-4 w-4" />
                  <span>Services professionnels sur mesure</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 - Notre Mission */}
            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white group-hover:scale-110 transition-transform">
                    <Target className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                      Notre Mission
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Accompagner la digitalisation, l'optimisation et la modernisation des systèmes
                      de mobilité pour répondre aux enjeux de fluidité, sécurité, inclusion et durabilité.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                    Fluidité
                  </Badge>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                    Sécurité
                  </Badge>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                    Inclusion
                  </Badge>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
                    Durabilité
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why UPJUNOO Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 border border-zinc-100 dark:border-zinc-800">
          <div className="text-center mb-12">
            <Badge className="bg-[#1a9ea3]/10 text-[#1a9ea3] border-0 mb-4">
              Pourquoi choisir UPJUNOO ?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Un écosystème digital de nouvelle génération
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
              UPJUNOO agit comme une infrastructure digitale complète au service des gouvernements,
              des entreprises et des citoyens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#1a9ea3]/5 to-transparent">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a9ea3] to-[#158084] text-white flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Innovation</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Solutions utiles, évolutives et responsables
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Performance</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Optimisez opérations, productivité et croissance
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Confiance</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Transparence, sécurité et confidentialité assurées
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Inclusion</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Technologie accessible à tous, sans distinction
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-[#1a9ea3] to-[#158084] rounded-3xl p-8 md:p-12 text-white text-center">
          <Building2 className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à rejoindre l'écosystème UPJUNOO ?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Que vous soyez une entreprise, une institution ou un particulier, nos solutions s'adaptent à vos besoins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:contact@upjunoo.com">
              <Button size="lg" className="bg-white text-[#1a9ea3] hover:bg-zinc-100 px-8">
                Nous contacter
              </Button>
            </Link>
            <Link href="/pdf/13-New Plaquette UPJUNOO.pdf" target="_blank">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1a9ea3] transition-all px-8">
                Télécharger la plaquette
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a9ea3] py-2 px-4 mt-12">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-white/90 text-xs">
            <Link href="/confidentialite" className="hover:text-white transition-colors">
              Confidentialité et cookies
            </Link>
            <Link href="/conditions" className="hover:text-white transition-colors">
              Conditions d'utilisation
            </Link>
            <Link href="/annonces" className="hover:text-white transition-colors">
              A propos de nos annonces
            </Link>
          </div>
          <span className="text-white/90 text-xs">
            Copyright UPJUNOO! - 2025
          </span>
        </div>
      </footer>
    </div>
  );
}
