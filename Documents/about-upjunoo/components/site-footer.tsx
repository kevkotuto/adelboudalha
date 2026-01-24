import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Produits</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><Link href="/#upjunoo-pro" className="hover:text-gray-900">Mobilité</Link></li>
                            <li><Link href="/#upmarchand" className="hover:text-gray-900">Commerce</Link></li>
                            <li><Link href="/#uppay" className="hover:text-gray-900">Paiements</Link></li>
                            <li><Link href="/#updata" className="hover:text-gray-900">Data</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Entreprise</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><Link href="/a-propos" className="hover:text-gray-900">À propos</Link></li>
                            {/* <li><a href="#" className="hover:text-gray-900">Carrières</a></li> */}
                            <li><a href="https://upjunoo.com/actualites" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Actualités</a></li>
                            {/* <li><a href="#" className="hover:text-gray-900">Contact</a></li> */}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Ressources</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            {/* <li><a href="#" className="hover:text-gray-900">Documentation</a></li> */}
                            <li><Link href="/aide" className="hover:text-gray-900">Support</Link></li>
                            {/* <li><a href="#" className="hover:text-gray-900">API</a></li> */}
                            {/* <li><a href="#" className="hover:text-gray-900">Guides</a></li> */}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Légal</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><Link href="/legal/confidentialite" className="hover:text-gray-900">Confidentialité</Link></li>
                            <li><Link href="/legal/conditions" className="hover:text-gray-900">Conditions</Link></li>
                            <li><Link href="/legal/cookies" className="hover:text-gray-900">Cookies</Link></li>
                            <li><Link href="/legal/securite" className="hover:text-gray-900">Sécurité</Link></li>
                            <li><Link href="/accessibilite" className="hover:text-gray-900">Accessibilité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <Image
                            src="/logo_carrer.png"
                            alt="UPJUNOO"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                        />
                        <span className="text-sm text-gray-600">© 2025 UPJUNOO. Tous droits réservés.</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>Français</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
