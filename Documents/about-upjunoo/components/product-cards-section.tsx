import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickLinkCard {
  title: string;
  href: string;
  imageSrc?: string;
  iconSrc?: string;
  gradient?: string;
  color?: string;
}

const quickLinks: QuickLinkCard[] = [
  {
    title: "Centre d'aide UPJUNOO",
    href: "/aide",
    gradient: "from-blue-50 to-indigo-50",
    iconSrc: "/iconUpjunoo/academy-tool.svg"
  },
  {
    title: "Boutique UPJUNOO",
    href: "#upmarchand",
    gradient: "from-emerald-50 to-teal-50",
    color: "#059669",
    iconSrc: "/iconUpjunoo/shopping.svg"
  },
  {
    title: "Votre compte UPJUNOO",
    href: "https://upjunoo.com/mon-espace",
    gradient: "from-orange-50 to-red-50",
    color: "#ea580c",
    iconSrc: "/iconUpjunoo/layers.svg"
  },
  {
    title: "Accessibilité",
    href: "/accessibilite",
    gradient: "from-purple-50 to-pink-50",
    color: "#9333ea",
    iconSrc: "/iconUpjunoo/directions.svg"
  }
];

export function ProductCardsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href} className="block group">
              <Card className="flex h-40 overflow-hidden border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
                {/* Left Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <h3 className="text-xl font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                    {link.title}
                  </h3>
                  <div>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center 
                      bg-blue-50 text-blue-600 
                      group-hover:bg-blue-100 transition-colors
                    `}>
                      <ExternalLink size={20} />
                    </div>
                  </div>
                </div>

                {/* Right Image/Visual */}
                <div className={`w-1/3 relative bg-gradient-to-br ${link.gradient} flex items-center justify-center overflow-hidden`}>
                  {link.iconSrc && (
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                      <Image
                        src={link.iconSrc}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 opacity-90"
                      />
                    </div>
                  )}
                  {/* Decorative circle */}
                  <div
                    className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20"
                    style={{ backgroundColor: link.color }}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
