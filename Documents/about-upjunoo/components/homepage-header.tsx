"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function HomepageHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="UPJUNOO"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/a-propos" className="text-gray-600 hover:text-gray-900 transition-colors">
              À propos
            </Link>
            <Link href="/" className="text-[#1a9ea3] font-medium">
              Produits
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Entreprise
            </Link>
            <Link href="https://upjunoo.com/actualites" target="_blank" className="text-gray-600 hover:text-gray-900 transition-colors">
              Actualités
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}