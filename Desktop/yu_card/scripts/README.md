# Scripts Utilitaires - Yu Card

## 🧹 clear-cache.sh

Script de nettoyage complet des caches Metro et Expo.

### Utilisation

```bash
./scripts/clear-cache.sh
```

### Quand l'utiliser ?

Utilisez ce script quand vous rencontrez:
- ❌ Erreurs "Unable to resolve module"
- ❌ Fichiers non trouvés alors qu'ils existent
- ❌ Modifications non prises en compte
- ❌ Comportements étranges du bundler

### Ce qu'il fait

1. ✅ Arrête le serveur Metro (port 8081)
2. ✅ Supprime `.expo/`
3. ✅ Supprime `node_modules/.cache/`
4. ✅ Supprime `.metro-cache/`
5. ✅ Nettoie Watchman (si installé)
6. ✅ Redémarre avec `npm start --clear`

### Exemple d'utilisation

```bash
# Vous modifiez des fichiers
git pull origin main

# Erreur Metro: "Cannot resolve @/components/ui/..."
./scripts/clear-cache.sh

# ✨ Le cache est nettoyé et le serveur redémarre
```

## 🛠️ Autres Scripts (à créer au besoin)

### build.sh (suggéré)
```bash
#!/bin/bash
# Build production
npx expo export --platform all
```

### test.sh (suggéré)
```bash
#!/bin/bash
# Run tests
npm run test
npm run lint
```

### deploy.sh (suggéré)
```bash
#!/bin/bash
# Deploy to EAS
eas build --platform all
eas submit --platform all
```

## 📝 Notes

- Tous les scripts doivent être exécutables: `chmod +x scripts/*.sh`
- Utilisez des chemins relatifs pour la portabilité
- Ajoutez des messages de progression pour l'utilisateur
- Gérez les erreurs gracieusement

---

**Ajouté le**: 2025-10-07
**Version**: 1.0
