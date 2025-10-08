# Correction du Format de Données Backend

## Problème Identifié

Le backend retourne les données paginées dans un format différent de celui attendu par le frontend :

### Format Backend (Actuel)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [...items...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Format Frontend Attendu
```json
{
  "items": [...items...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Impact

Le code cherchait `response.items` mais le backend retournait `response.data`, ce qui causait :
- ✅ **Symptôme observé** : Les catégories par défaut (Apple, Google, Nintendo mockées) s'affichaient au lieu des vraies catégories du backend
- ✅ **Cause** : `categoriesResponse.items` était `undefined`, donc le code utilisait le fallback `DEFAULT_CATEGORIES`

## Solution Implémentée

Transformation des réponses dans les services pour normaliser le format :

### Fichiers Modifiés

#### 1. `services/categoriesService.ts`
```typescript
async getCategories(params?: CategoriesQueryParams): Promise<PaginatedResponse<Category>> {
  const response = await apiClient.getPaginated<Category>(...);

  // Transform backend format to frontend format
  if (response && typeof response === 'object') {
    const backendResponse = response as any;
    if (backendResponse.data && !backendResponse.items) {
      return {
        items: backendResponse.data,
        pagination: backendResponse.pagination || {...},
      };
    }
  }

  return response;
}
```

#### 2. `services/giftCardsService.ts`
Même transformation appliquée à la méthode `getGiftCards()`.

#### 3. `services/productsService.ts`
Même transformation appliquée à la méthode `getProducts()`.

### Logique de Transformation

```typescript
// Détecte le format backend
if (backendResponse.data && !backendResponse.items) {
  // Transforme en format frontend
  return {
    items: backendResponse.data,
    pagination: backendResponse.pagination || defaultPagination,
  };
}
```

## Vérification

### Avant la Correction
```javascript
console.log('Categories from API:', categoriesResponse);
// Output: { data: [...], pagination: {...} }

console.log('Categories items:', categoriesResponse.items);
// Output: undefined

console.log('No categories from API, using defaults');
// Affiche DEFAULT_CATEGORIES
```

### Après la Correction
```javascript
console.log('Categories from API:', categoriesResponse);
// Output: { items: [...], pagination: {...} }

console.log('Categories items:', categoriesResponse.items);
// Output: [{ id: '...', name: 'Apple', iconUrl: '...' }, ...]

console.log('Mapped categories:', mappedCategories);
// Output: [{ id: '...', name: 'Apple', image: { uri: 'https://...' } }, ...]
```

## Tests à Effectuer

1. **Écran d'accueil** : Vérifier que les 6 premières catégories du backend s'affichent
2. **Écran des catégories** : Vérifier que toutes les catégories se chargent correctement
3. **Images** : Vérifier que les `iconUrl` du backend sont transformées en URLs complètes
4. **Fallback** : Vérifier que si `iconUrl` est null, l'image par défaut s'affiche

## Compatibilité

La transformation est **rétro-compatible** :
- Si le backend retourne déjà `items`, elle est retournée telle quelle
- Si le backend retourne `data`, elle est transformée en `items`
- Fonctionne avec les deux formats

## Fichiers Impactés

- ✅ `services/categoriesService.ts` - Méthode `getCategories()`
- ✅ `services/giftCardsService.ts` - Méthode `getGiftCards()`
- ✅ `services/productsService.ts` - Méthode `getProducts()`
- ✅ `app/(tabs)/index.tsx` - Logs ajoutés pour debugging

## Alternatives Considérées

### Option 1 : Modifier le Backend ❌
- Nécessite des changements côté serveur
- Délai de déploiement
- Impact sur d'autres clients potentiels

### Option 2 : Modifier le Type PaginatedResponse ❌
```typescript
// Accepter les deux formats
type PaginatedResponse<T> = {
  items?: T[];
  data?: T[];
  pagination: {...};
}
```
- Crée de l'ambiguïté
- Code client doit gérer les deux cas partout
- Moins type-safe

### Option 3 : Transformer dans les Services ✅ (Choisie)
- Transformation centralisée
- Transparente pour le code client
- Type-safe
- Facile à retirer si le backend change

## Prochaines Étapes

1. Tester avec le backend réel
2. Vérifier tous les endpoints paginés
3. Si le pattern se confirme, créer une fonction helper réutilisable :

```typescript
// services/utils/transformPaginatedResponse.ts
export function normalizePaginatedResponse<T>(response: any): PaginatedResponse<T> {
  if (response?.data && !response?.items) {
    return {
      items: response.data,
      pagination: response.pagination,
    };
  }
  return response;
}
```

4. Appliquer à tous les services utilisant `getPaginated()`
