# 🔧 Correctif : React Hooks Error dans Categories Screen

**Date** : 2025-10-03
**Statut** : ✅ Résolu

---

## 🐛 Problème Identifié

### Erreur : Invalid hook call

```
ERROR  [Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app

Code: categories.tsx:154:24
  161 |   const renderCategory = ({ item, index }: { item: Category; index: number }) => {
  169 |     const fadeAnim = useRef(new Animated.Value(0)).current;
  170 |     const translateY = useRef(new Animated.Value(20)).current;
  172 |     useEffect(() => {
```

**Cause** : Les hooks React (`useRef`, `useEffect`) étaient appelés à l'intérieur de la fonction `renderCategory`, qui est passée comme `renderItem` prop à la FlatList. Cette fonction n'est **pas** un composant React, mais une render function, donc les hooks ne peuvent pas y être utilisés.

---

## ⚠️ Les Règles des Hooks React

### Règles strictes à respecter :

1. **Les hooks ne peuvent être appelés que dans des composants React**
   - ✅ Composant fonctionnel : `function MyComponent() { ... }`
   - ❌ Fonction de rendu : `const renderItem = () => { ... }`

2. **Les hooks doivent être appelés au niveau supérieur**
   - ✅ Au niveau du composant
   - ❌ À l'intérieur de boucles, conditions, ou fonctions imbriquées

3. **Les hooks doivent être appelés dans le même ordre à chaque rendu**
   - ❌ Appeler des hooks conditionnellement
   - ✅ Toujours dans le même ordre

---

## ✅ Solution Implémentée

### Transformation de `renderCategory` en composant React séparé

**AVANT** (❌ Violation des règles des hooks) :
```typescript
const renderCategory = ({ item, index }: { item: Category; index: number }) => {
  // Get image from iconUrl or fallback to default
  const iconUrl = buildImageUrl(item.iconUrl);
  const image = iconUrl
    ? { uri: iconUrl }
    : DEFAULT_CATEGORY_IMAGES[item.slug] || DEFAULT_CATEGORY_IMAGES['gaming'];

  // Animation - ❌ ERREUR : Hooks dans une render function
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <CategoryImageCard
        title={item.name}
        image={image}
        onPress={() => handleCategoryPress(item)}
      />
    </Animated.View>
  );
};
```

**APRÈS** (✅ Hooks dans un composant React) :
```typescript
// Separate component for animated category item
const CategoryItem = ({ item, index }: { item: Category; index: number }) => {
  // Get image from iconUrl or fallback to default
  const iconUrl = buildImageUrl(item.iconUrl);
  const image = iconUrl
    ? { uri: iconUrl }
    : DEFAULT_CATEGORY_IMAGES[item.slug] || DEFAULT_CATEGORY_IMAGES['gaming'];

  // Animation - ✅ OK : Hooks dans un composant React
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]); // ✅ Ajout de dependency array avec index

  return (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <CategoryImageCard
        title={item.name}
        image={image}
        onPress={() => handleCategoryPress(item)}
      />
    </Animated.View>
  );
};

// Render function qui utilise le composant
const renderCategory = ({ item, index }: { item: Category; index: number }) => {
  return <CategoryItem item={item} index={index} />;
};
```

---

## 🔄 Différences Clés

### 1. Création d'un Composant React Séparé

**`CategoryItem`** est maintenant un **composant React fonctionnel**, pas une simple fonction de rendu :

```typescript
// ✅ Composant React (commence par une majuscule)
const CategoryItem = ({ item, index }) => { ... }

// vs

// ❌ Fonction de rendu (minuscule)
const renderCategory = ({ item, index }) => { ... }
```

### 2. Utilisation Correcte de `useEffect`

Ajout de `index` dans le tableau de dépendances :

```typescript
// AVANT : [] (vide - problème potentiel)
useEffect(() => {
  // Animation avec index
}, []); // ❌ index manquant dans les dépendances

// APRÈS : [index]
useEffect(() => {
  // Animation avec index
}, [index]); // ✅ index inclus dans les dépendances
```

### 3. Séparation des Responsabilités

```typescript
// CategoryItem : Composant React avec logique et animation
const CategoryItem = ({ item, index }) => { ... }

// renderCategory : Simple wrapper pour FlatList
const renderCategory = ({ item, index }) => {
  return <CategoryItem item={item} index={index} />;
};

// FlatList utilise renderCategory
<FlatList
  data={filteredCategories}
  renderItem={renderCategory}
  ...
/>
```

---

## 🎯 Avantages de Cette Approche

### 1. **Respect des Règles des Hooks** ✅
- Les hooks sont maintenant dans un composant React valide
- Pas de violation des règles React

### 2. **Meilleure Performance** ⚡
- React peut optimiser le rendu du composant `CategoryItem`
- Les animations sont gérées correctement par composant

### 3. **Meilleure Lisibilité** 📖
- Séparation claire entre le composant et la render function
- Code plus maintenable et testable

### 4. **Isolation de l'État** 🔒
- Chaque `CategoryItem` a son propre état d'animation
- Pas d'interférence entre les items

---

## 📝 Fichier Modifié

### [app/(tabs)/categories.tsx](app/(tabs)/categories.tsx)
- Lignes 161-211 : Transformation de `renderCategory` en composant `CategoryItem`
- Ajout du composant `CategoryItem` avec hooks correctement placés
- `renderCategory` devient un simple wrapper

---

## 🧪 Tests de Validation

### ✅ Test 1 : Affichage des catégories
1. Naviguer vers l'onglet "Catégories"
2. **Résultat attendu** :
   - ✅ Pas d'erreur "Invalid hook call"
   - ✅ Les catégories s'affichent correctement
   - ✅ Les animations de fade-in fonctionnent

### ✅ Test 2 : Filtrage des catégories
1. Utiliser la barre de recherche
2. Taper "Play" pour chercher "PlayStation"
3. **Résultat attendu** :
   - ✅ Les catégories sont filtrées correctement
   - ✅ Pas d'erreur lors du re-render

### ✅ Test 3 : Filtres badges
1. Cliquer sur "Cartes cadeaux"
2. Cliquer sur "Produits"
3. **Résultat attendu** :
   - ✅ Les badges changent d'état actif
   - ✅ Les catégories sont filtrées selon le type
   - ✅ Les animations se jouent pour les nouveaux items

### ✅ Test 4 : Navigation
1. Cliquer sur une catégorie (ex: PlayStation)
2. **Résultat attendu** :
   - ✅ Navigation vers `/search-results` avec les bons params
   - ✅ Pas d'erreur de hooks lors du démontage

---

## 📚 Ressources Supplémentaires

### Documentation React Hooks
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useRef](https://react.dev/reference/react/useRef)

### Bonnes Pratiques React Native
- [Animated API Best Practices](https://reactnative.dev/docs/animated)
- [FlatList Performance Tips](https://reactnative.dev/docs/optimizing-flatlist-configuration)

---

## 🎨 Pattern Réutilisable

### Pour les Composants Animés dans FlatList

```typescript
// ✅ PATTERN RECOMMANDÉ

// 1. Créer un composant React séparé
const AnimatedListItem = ({ item, index }) => {
  // Hooks autorisés ici
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation logic
  }, [index]);

  return <View>{/* Your component */}</View>;
};

// 2. Créer une render function qui utilise le composant
const renderItem = ({ item, index }) => {
  return <AnimatedListItem item={item} index={index} />;
};

// 3. Utiliser dans FlatList
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
/>
```

### ❌ PATTERN À ÉVITER

```typescript
// ❌ NE PAS FAIRE CECI
const renderItem = ({ item, index }) => {
  // ❌ ERREUR : Hooks dans une render function
  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => { ... }, []);

  return <View>{/* Your component */}</View>;
};
```

---

## 🎯 Conclusion

### Problème Résolu ✅
- ✅ Erreur "Invalid hook call" corrigée
- ✅ Les hooks sont maintenant dans un composant React valide
- ✅ Les animations fonctionnent correctement
- ✅ Code conforme aux règles de React

### Bonnes Pratiques Appliquées ✅
- ✅ Respect des Rules of Hooks
- ✅ Séparation des responsabilités
- ✅ Code maintenable et testable
- ✅ Performance optimisée

### Pattern Documenté ✅
- ✅ Pattern réutilisable pour d'autres écrans
- ✅ Documentation des erreurs communes
- ✅ Exemples de bonnes et mauvaises pratiques

---

**Développeur** : Adel Boudalha
**Framework** : React Native + Expo Router
**React Version** : 19.1.0
