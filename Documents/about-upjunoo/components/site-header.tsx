"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname?.startsWith(path)) return true;
        return false;
    };

    const linkClass = (path: string) =>
        `text-sm font-medium transition-colors ${isActive(path) ? "text-[#1a9ea3]" : "text-gray-600 hover:text-gray-900"}`;

    const mobileLinkClass = (path: string) =>
        `block text-sm font-medium ${isActive(path) ? "text-[#1a9ea3]" : "text-gray-600 hover:text-gray-900"}`;

    return (
        <header className="border-b border-gray-100 sticky top-0 bg-white z-40">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="UPJUNOO"
                                width={240}
                                height={64}
                                className="h-16 w-auto"
                            />
                        </Link>

                        {/* Navigation Desktop */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="/a-propos" className={linkClass("/a-propos")}>À propos</Link>
                            {/* Products link is a bit special since it's an anchor on home, we treat it as active if on home but not specific subpages if we wanted, 
                                but for now let's just use the strict path or a dedicated check. 
                                The user likely considers "/" as the products page effectively. 
                            */}
                            <Link href="/#products-section" className={`text-sm font-medium transition-colors ${pathname === "/" ? "text-[#1a9ea3]" : "text-gray-600 hover:text-gray-900"}`}>Produits</Link>
                            <Link href="/services-pro" className={linkClass("/services-pro")}>Services Professionnels</Link>
                            {/* <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Entreprise</a> */}
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
                        <Link href="/a-propos" className={mobileLinkClass("/a-propos")}>À propos</Link>
                        <Link href="/#products-section" className={`block text-sm font-medium ${pathname === "/" ? "text-[#1a9ea3]" : "text-gray-600 hover:text-gray-900"}`}>Produits</Link>
                        <Link href="/services-pro" className={mobileLinkClass("/services-pro")}>Services Professionnels</Link>
                        {/* <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Entreprise</a> */}
                        <a href="https://upjunoo.com/actualites" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-600 hover:text-gray-900">Actualités</a>
                    </nav>
                </div>
            )}
        </header>
    );
}
