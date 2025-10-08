# Gestion des URLs d'Images - Documentation

## Vue d'ensemble

Ce document explique comment les URLs des images provenant du backend sont gérées dans l'application Yu Card pour garantir qu'elles s'affichent correctement, qu'elles soient relatives ou absolues.

## Problème

Le backend Prisma retourne des URLs d'images qui peuvent être :
- **Relatives** : `/uploads/categories/icon.png`
- **Absolutes** : `https://yucard.generale-ci.com/uploads/categories/icon.png`

React Native nécessite des URLs complètes pour afficher les images via `{ uri: 'URL' }`.

## Solution

### Fonctions Helper (`services/config.ts`)

Trois fonctions helper ont été créées pour gérer les URLs :

#### 1. `buildImageUrl(url: string | null | undefined): string | null`

Convertit une URL (relative ou absolue) en URL complète.

```typescript
// Exemples d'utilisation
buildImageUrl('/uploads/icon.png')
// → 'http://localhost:30010/uploads/icon.png' (dev)
// → 'https://yucard.generale-ci.com/uploads/icon.png' (prod)

buildImageUrl('https://cdn.example.com/icon.png')
// → 'https://cdn.example.com/icon.png' (inchangé)

buildImageUrl(null)
// → null
```

**Utilisation** : Pour les catégories et cartes cadeaux (champ unique `iconUrl` ou `imageUrl`)

#### 2. `buildImageUrls(urls: string[] | null | undefined): string[]`

Convertit un tableau d'URLs en URLs complètes.

```typescript
// Exemple
buildImageUrls(['/img1.png', '/img2.png', 'https://cdn.com/img3.png'])
// → [
//   'http://localhost:30010/img1.png',
//   'http://localhost:30010/img2.png',
//   'https://cdn.com/img3.png'
// ]
```

**Utilisation** : Pour les produits physiques (champ `images` qui est un tableau)

#### 3. `getFirstImageUrl(images: string[] | null | undefined): string | null`

Récupère la première URL d'un tableau d'images (utile pour les miniatures).

```typescript
// Exemple
getFirstImageUrl(['/img1.png', '/img2.png'])
// → 'http://localhost:30010/img1.png'

getFirstImageUrl([])
// → null
```

**Utilisation** : Pour afficher la miniature d'un produit dans une liste

## Modèles Prisma et Champs d'Images

### Category
```typescript
{
  iconUrl?: string;  // URL de l'icône de catégorie
}
```

### GiftCard
```typescript
{
  imageUrl: string;           // Image principale
  backgroundImageUrl?: string; // Image de fond (optionnelle)
}
```

### PhysicalProduct
```typescript
{
  images: string[];  // Tableau d'URLs d'images
}
```

## Implémentation dans l'Application

### 1. Écran d'Accueil (`app/(tabs)/index.tsx`)

#### Catégories
```typescript
const iconUrl = buildImageUrl(cat.iconUrl);
const image = iconUrl
  ? { uri: iconUrl }
  : DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length]?.image;
```

#### Cartes Cadeaux
```typescript
const imageUrl = buildImageUrl(item.imageUrl);
<GiftCard
  image={imageUrl ? { uri: imageUrl } : undefined}
  // ...
/>
```

#### Produits Physiques
```typescript
const imageUrl = getFirstImageUrl(item.images);
<ProductCard
  image={imageUrl ? { uri: imageUrl } : undefined}
  // ...
/>
```

### 2. Écran des Catégories (`app/(tabs)/categories.tsx`)

```typescript
const iconUrl = buildImageUrl(item.iconUrl);
const image = iconUrl
  ? { uri: iconUrl }
  : DEFAULT_CATEGORY_IMAGES[item.slug] || DEFAULT_CATEGORY_IMAGES['gaming'];

<CategoryImageCard
  image={image}
  // ...
/>
```

## Système de Fallback

Chaque type d'élément a des images par défaut en cas d'absence d'`iconUrl` ou d'`imageUrl` :

### Catégories
```typescript
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Apple', image: require('@/assets/mock/categories/apple.png') },
  { id: '2', name: 'Google', image: require('@/assets/mock/categories/google.png') },
  // ...
];
```

### Images de Catégories par Slug
```typescript
const DEFAULT_CATEGORY_IMAGES: Record<string, any> = {
  gaming: require('@/assets/mock/categories/playstation.png'),
  tech: require('@/assets/mock/categories/apple.png'),
  // ...
};
```

## Configuration de l'API

L'URL de base de l'API est configurée dans `services/config.ts` :

```typescript
const config = {
  apiUrl: __DEV__
    ? 'http://localhost:30010'           // Développement
    : 'https://yucard.generale-ci.com',  // Production
};
```

## Bonnes Pratiques

1. **Toujours utiliser les helper functions** pour les URLs d'images provenant du backend
2. **Toujours prévoir un fallback** avec des images locales par défaut
3. **Vérifier null/undefined** avant de passer l'URL aux composants
4. **Utiliser `getFirstImageUrl`** pour les miniatures de produits
5. **Utiliser `buildImageUrls`** pour les galeries d'images complètes

## Fichiers Modifiés

- ✅ `services/config.ts` - Ajout des fonctions helper
- ✅ `app/(tabs)/index.tsx` - Gestion des URLs pour catégories, cartes cadeaux et produits
- ✅ `app/(tabs)/categories.tsx` - Gestion des URLs pour les catégories

## Tests

Pour tester le bon fonctionnement :

1. **Backend retourne URL relative** : `/uploads/icon.png`
   - ✅ L'image doit s'afficher avec l'URL complète `http://localhost:30010/uploads/icon.png`

2. **Backend retourne URL absolue** : `https://cdn.example.com/icon.png`
   - ✅ L'image doit s'afficher avec l'URL inchangée

3. **Backend retourne `null`** :
   - ✅ L'image de fallback par défaut doit s'afficher

4. **Backend retourne tableau vide** : `[]`
   - ✅ L'image de fallback par défaut doit s'afficher

## Notes Importantes

- Les composants UI (`GiftCard`, `ProductCard`, `CategoryImageCard`) acceptent déjà les deux formats :
  - Images locales : `require('@/assets/...')`
  - Images distantes : `{ uri: 'https://...' }`

- La transformation des URLs se fait **avant** de passer les props aux composants

- Les fonctions helper gèrent automatiquement :
  - Les valeurs `null` et `undefined`
  - Les URLs déjà complètes
  - Les URLs relatives
  - Les tableaux vides
