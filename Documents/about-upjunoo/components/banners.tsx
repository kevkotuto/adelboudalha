"use client"

import React from 'react'

interface HeroBannerProps {
  position: string
}

export function HeroBanner({ position }: HeroBannerProps) {
  // Simple banner component - you can customize this as needed
  return (
    <div className="bg-gradient-to-r from-[#1a9ea3] to-[#158084] rounded-lg p-6 text-white text-center">
      <h3 className="text-lg font-semibold mb-2">Découvrez l'écosystème UPJUNOO</h3>
      <p className="text-sm text-white/90">Solutions intelligentes pour un monde connecté</p>
    </div>
  )
}