"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Briefcase, MessageSquare, ShieldCheck, Zap, Smartphone, Cloud, Layout, Database, Search, Settings, Rocket, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ProfessionalServicesPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gray-50 py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Au-delà de nos produits, <br />
                            <span className="text-[#1a9ea3]">nous créons votre solution</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Vous avez un besoin spécifique qui n'est pas couvert par nos produits standards ?
                            Notre équipe d'experts est là pour concevoir et développer la solution technologique
                            parfaitement adaptée à votre entreprise.
                        </p>
                    </div>
                </section>

                {/* Value Proposition */}
                <section className="py-16 px-6 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="text-blue-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Développement Sur Mesure</h3>
                            <p className="text-gray-600">
                                Applications web, mobiles ou logiciels métiers, nous transformons votre vision en réalité avec les dernières technologies.
                            </p>
                        </div>
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck className="text-purple-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Conseil & expertise</h3>
                            <p className="text-gray-600">
                                Bénéficiez de notre expertise en architecture, sécurité et cloud pour optimiser vos systèmes existants.
                            </p>
                        </div>
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                                <Briefcase className="text-orange-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Intégration Système</h3>
                            <p className="text-gray-600">
                                Connectez vos outils et automatisez vos processus grâce à nos expertises en API et flux de données.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Expertise Section */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos domaines d'excellence</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="flex gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Smartphone className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Applications Web & Mobile</h3>
                                    <p className="text-gray-600 mb-2">
                                        Création d'expériences digitales fluides et performantes sur iOS, Android et Web.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Applications natives & hybrides</li>
                                        <li>• Progressive Web Apps (PWA)</li>
                                        <li>• Tableaux de bord & Back-office</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Database className="text-teal-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Data & Intelligence Artificielle</h3>
                                    <p className="text-gray-600 mb-2">
                                        Valorisez vos données avec nos solutions d'IA, de Machine Learning et d'analyse prédictive.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Algorithmes de recommandation</li>
                                        <li>• Chatbots & Agents intelligents</li>
                                        <li>• Analyse de données & Reporting</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Layout className="text-pink-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">UI/UX Design</h3>
                                    <p className="text-gray-600 mb-2">
                                        Conception centrée utilisateur pour des produits intuitifs, esthétiques et engageants.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Prototypage & Wireframing</li>
                                        <li>• Design System</li>
                                        <li>• Tests utilisateurs</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex gap-6 p-6 rounded-2xl hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Cloud className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cloud & Infrastructure</h3>
                                    <p className="text-gray-600 mb-2">
                                        Architectures robustes, scalables et sécurisées pour supporter votre croissance.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• DevOps & CI/CD</li>
                                        <li>• Migration Cloud (AWS, Azure, GCP)</li>
                                        <li>• Sécurité & Conformité</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Methodology Section */}
                    <div className="mb-24 bg-gray-50 rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Notre approche projet</h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-[#1a9ea3] font-bold text-xl">1</div>
                                <h3 className="font-bold text-gray-900 mb-2">Découverte</h3>
                                <p className="text-sm text-gray-600">Analyse de vos besoins et définition des objectifs.</p>
                            </div>
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-[#1a9ea3] font-bold text-xl">2</div>
                                <h3 className="font-bold text-gray-900 mb-2">Conception</h3>
                                <p className="text-sm text-gray-600">Design UX/UI et architecture technique.</p>
                            </div>
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-[#1a9ea3] font-bold text-xl">3</div>
                                <h3 className="font-bold text-gray-900 mb-2">Développement</h3>
                                <p className="text-sm text-gray-600">Développement Agile avec livraisons régulières.</p>
                            </div>
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-[#1a9ea3] font-bold text-xl">4</div>
                                <h3 className="font-bold text-gray-900 mb-2">Lancement</h3>
                                <p className="text-sm text-gray-600">Déploiement, formation et maintenance continue.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Section */}
                    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-[#1a9ea3] p-8 text-white text-center">
                            <MessageSquare className="mx-auto mb-4" size={40} />
                            <h2 className="text-2xl font-bold mb-2">Parlez-nous de votre projet</h2>
                            <p className="opacity-90">Remplissez ce formulaire et un expert vous recontactera sous 24h.</p>
                        </div>
                        <div className="p-8 md:p-12">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1a9ea3] focus:border-transparent outline-none transition-all"
                                            placeholder="Jean Dupont"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                                        <input
                                            type="text"
                                            id="company"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1a9ea3] focus:border-transparent outline-none transition-all"
                                            placeholder="Votre société"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1a9ea3] focus:border-transparent outline-none transition-all"
                                            placeholder="jean@entreprise.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1a9ea3] focus:border-transparent outline-none transition-all"
                                            placeholder="+33 6 00 00 00 00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Votre besoin</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1a9ea3] focus:border-transparent outline-none transition-all"
                                        placeholder="Décrivez votre projet ou votre problématique..."
                                    ></textarea>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-[#1a9ea3] text-white font-bold py-4 rounded-xl hover:bg-[#158084] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Demander un devis gratuit
                                    </button>
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-4">
                                    En soumettant ce formulaire, vous acceptez d'être contacté par nos équipes commerciales.
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    );
}
