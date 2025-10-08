#!/bin/bash

# Script de nettoyage du cache - Yu Card
# Utiliser quand l'app affiche des erreurs de modules non trouvés

echo "🧹 Nettoyage des caches..."

# 1. Arrêter le serveur Metro si actif
echo "📱 Arrêt du serveur Metro..."
lsof -ti:8081 | xargs kill -9 2>/dev/null
echo "✅ Port 8081 libéré"

# 2. Supprimer les caches
echo "🗑️ Suppression des caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .metro-cache
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null

echo "✅ Caches supprimés"

# 3. Nettoyer watchman si installé
if command -v watchman &> /dev/null; then
    echo "👁️ Nettoyage de Watchman..."
    watchman watch-del-all 2>/dev/null
    echo "✅ Watchman nettoyé"
fi

# 4. Redémarrer avec cache clear
echo "🚀 Redémarrage avec cache clear..."
npm start -- --clear

echo ""
echo "✨ Nettoyage terminé!"
echo "Le serveur de développement devrait redémarrer proprement."
