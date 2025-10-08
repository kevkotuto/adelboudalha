# Guide d'Intégration des Uploads - Yu Card

## 🎯 Vue d'ensemble

L'application Yu Card dispose d'un système complet d'upload d'images intégré avec le backend KEV Storage. Le système gère:

- **Avatars utilisateur** (200x200px, WebP, circulaire)
- **Images produits** (800x800px, WebP, max 10 images)
- **Images gift cards** (600x400px, WebP, max 5 images)

## 📦 Architecture

### Services

#### UploadService ([services/uploadService.ts](services/uploadService.ts))

Le service principal avec les méthodes:

```typescript
// Avatar utilisateur
uploadAvatar(file: FileUpload, options?, onProgress?): Promise<UploadResponse>

// Images produits (multiple)
uploadProductImages(files: FileUpload[], options?, onProgress?): Promise<UploadMultipleResponse>

// Image gift card (single)
uploadGiftCardImage(file: FileUpload, options?, onProgress?): Promise<UploadMultipleResponse>

// Images gift cards (multiple)
uploadGiftCardImages(files: FileUpload[], options?, onProgress?): Promise<UploadMultipleResponse>
```

### Composants UI

#### ImageUploadButton ([components/ui/Inputs/ImageUploadButton.tsx](components/ui/Inputs/ImageUploadButton.tsx))

Composant réutilisable pour tous les types d'upload:

```tsx
<ImageUploadButton
  type="avatar" | "gift-card" | "product"
  currentImageUrl={string}
  onUploadComplete={(url: string) => void}
  onUploadStart={() => void}
  onUploadError={(error: string) => void}
  multiple={boolean}
  disabled={boolean}
  size="small" | "medium" | "large"
/>
```

**Fonctionnalités:**
- Sélection depuis la galerie
- Permission handling automatique
- Preview de l'image
- Loading state pendant l'upload
- Badge de succès après upload
- Icône de modification

## 🔧 Endpoints API

### Routes Configurées

```typescript
// Config actuelle (services/config.ts)
UPLOAD: {
  AVATAR: '/upload/avatar',          // ⚠️ À vérifier
  PRODUCT_IMAGES: '/upload/product-images',
  GIFT_CARD_IMAGES: '/upload/gift-card-images',
}

USERS: {
  AVATAR: '/users/avatar',           // Route backend documentée
}
```

### ⚠️ Problème Identifié

L'erreur 500 vient d'une incohérence entre:
- **Route app**: `/upload/avatar`
- **Route backend**: `/users/avatar` (selon documentation)

### ✅ Solution

Mettre à jour [services/config.ts](services/config.ts:177):

```typescript
UPLOAD: {
  BASE: '/upload',
  IMAGE: '/upload/image',
  IMAGES: '/upload/images',
  PRODUCT_IMAGES: '/upload/product-images',
  GIFT_CARD_IMAGES: '/upload/gift-card-images',
  AVATAR: '/users/avatar',  // ← FIX: Utiliser la route users
  DOCUMENT: '/upload/document',
  // ...
}
```

## 📱 Utilisation dans l'App

### 1. Upload d'Avatar (Profil Utilisateur)

L'écran [app/profile/edit.tsx](app/profile/edit.tsx) utilise déjà le système:

```tsx
<ImageUploadButton
  type="avatar"
  currentImageUrl={avatarUrl}
  onUploadComplete={(url) => setAvatarUrl(url)}
  onUploadStart={() => setUploadingAvatar(true)}
  onUploadError={(error) => {
    setUploadingAvatar(false);
    console.error('Avatar upload error:', error);
  }}
  size="large"
  disabled={uploadingAvatar}
/>
```

**Workflow:**
1. Utilisateur clique sur ImageUploadButton
2. Sélection d'image (galerie ou caméra)
3. Upload automatique vers `/users/avatar`
4. Callback `onUploadComplete` avec l'URL
5. Mise à jour du profil via `userService.updateProfile()`

### 2. Upload d'Images Produits (Admin)

Pour créer un écran admin de création de produit:

```tsx
import { ImageUploadButton } from '@/components/ui/Inputs/ImageUploadButton';

const [productImages, setProductImages] = useState<string[]>([]);

<ImageUploadButton
  type="product"
  multiple={true}
  onUploadComplete={(url) => {
    setProductImages([...productImages, url]);
  }}
  size="large"
/>
```

### 3. Upload d'Images Gift Cards (Admin)

```tsx
const [giftCardImage, setGiftCardImage] = useState('');

<ImageUploadButton
  type="gift-card"
  currentImageUrl={giftCardImage}
  onUploadComplete={setGiftCardImage}
  size="large"
/>
```

## 🔄 Workflow Backend

Selon la documentation backend:

### Avatar Upload

```bash
POST /api/users/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- avatar: fichier (JPEG, PNG, max 2MB)

Response:
{
  "success": true,
  "data": {
    "user": { "avatarUrl": "https://..." },
    "file": { "url": "https://...", "size": 245678, ... }
  }
}
```

**Traitement automatique:**
- Redimensionnement: 200x200px
- Format: WebP
- Qualité: 85%
- Fit: cover (carré)

### Product Images Upload

```bash
POST /api/products/{productId}/images
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Body:
- images[]: fichiers (max 10)

Response:
{
  "success": true,
  "data": {
    "files": [
      { "url": "https://...", ... }
    ]
  }
}
```

**Traitement automatique:**
- Redimensionnement: 800x800px
- Format: WebP
- Qualité: 85%
- Fit: inside (conserve proportions)

### Gift Card Images Upload

```bash
POST /api/gift-cards/{giftCardId}/images
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Body:
- images[]: fichiers (max 5)

Response:
{
  "success": true,
  "data": {
    "files": [
      { "url": "https://...", ... }
    ]
  }
}
```

**Traitement automatique:**
- Redimensionnement: 600x400px
- Format: WebP
- Qualité: 90%
- Fit: cover

## 🐛 Debugging

### Logs à Vérifier

```typescript
// Dans uploadService.ts
LOG  🌐 API Request: {
  "method": "POST",
  "url": "/upload/avatar",  // ← Vérifier cette URL
  "fullURL": "https://yucard.generale-ci.com/api/upload/avatar"
}

ERROR ❌ API Request threw error: {
  "error": "Request failed with status code 500",
  "method": "POST",
  "url": "/upload/avatar"
}
```

### Tests Manuels

```bash
# Test direct avec cURL
curl -X POST https://yucard.generale-ci.com/api/users/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@photo.jpg"

# Devrait retourner:
# { "success": true, "data": { "user": {...}, "file": {...} } }
```

## ✅ Actions à Réaliser

1. **Corriger l'endpoint avatar** dans [services/config.ts](services/config.ts:177)
   ```typescript
   AVATAR: '/users/avatar',  // au lieu de '/upload/avatar'
   ```

2. **Tester l'upload avatar** dans l'app
   - Aller sur Profile Edit
   - Changer la photo de profil
   - Vérifier les logs
   - Confirmer le succès

3. **Créer les écrans admin** (optionnel)
   - Écran de création de produit avec upload multiple
   - Écran de création de gift card avec upload

4. **Documentation supplémentaire**
   - Ajouter des exemples d'utilisation
   - Screenshots des écrans
   - Guide de troubleshooting

## 📚 Références

- **Backend API Doc**: Fournie dans le prompt initial
- **ImageUploadButton**: [components/ui/Inputs/ImageUploadButton.tsx](components/ui/Inputs/ImageUploadButton.tsx)
- **UploadService**: [services/uploadService.ts](services/uploadService.ts)
- **Écran Profile Edit**: [app/profile/edit.tsx](app/profile/edit.tsx)
- **API Config**: [services/config.ts](services/config.ts)

## 🎨 Design System

Les uploads respectent le design system Yu Card:
- Minimal shadows
- Ubuntu font family
- Couleurs: Chick Yellow (#F4D03F), Black, White
- Border radius et spacing cohérents

---

**Status**: ✅ Système fonctionnel, nécessite correction de l'endpoint avatar
**Dernière mise à jour**: 2025-10-07
