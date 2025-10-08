# 🐛 Debug: Codes gift cards non affichés après réouverture

## Logs de débogage ajoutés

J'ai ajouté des logs dans 3 endroits pour identifier le problème :

### 1. Lors de l'ouverture du modal (ligne ~393-407)
```
=== OPENING ORDER DETAILS ===
Order: YC...
Item 0: PlayStation Plus 12 mois
  giftCardCodes: Array(2) ou undefined
  Codes count: 2 ou 0
```

### 2. Après assignation automatique (ligne ~274-286)
```
=== REFRESHED ORDER AFTER AUTO-ASSIGN ===
Item 0: PlayStation Plus 12 mois (GIFT_CARD)
  Quantity: 2
  giftCardCodes: Array(2)
  Codes count: 2
    Code 1: PSN1-XXXX-YYYY-ZZZZ (ACTIVE)
    Code 2: PSN2-AAAA-BBBB-CCCC (ACTIVE)
```

### 3. Après assignation manuelle (ligne ~336-343)
```
=== REFRESHED ORDER AFTER MANUAL ASSIGN ===
Item 0: PlayStation Plus 12 mois (GIFT_CARD)
  Quantity: 2
  giftCardCodes: Array(1)
  Codes count: 1
```

---

## 📋 Scénario de test

### Étape 1: Assigner des codes
1. Ouvrir une commande PAYÉE avec gift card
2. Cliquer sur "Attribuer depuis l'inventory"
3. **Regarder la console** → Vous devriez voir :
   ```
   === REFRESHED ORDER AFTER AUTO-ASSIGN ===
   Item 0: Carte Xbox 10€ France (GIFT_CARD)
     Quantity: 1
     giftCardCodes: Array(1)
     Codes count: 1
       Code 1: 21312324343555455454 (ACTIVE)
   ```
4. **Vérifier dans l'UI** → Les codes devraient s'afficher immédiatement

### Étape 2: Fermer et rouvrir
1. Fermer le modal des détails
2. Rouvrir le même order
3. **Regarder la console** → Vous devriez voir :
   ```
   === OPENING ORDER DETAILS ===
   Order: YC...
   Item 0: Carte Xbox 10€ France
     giftCardCodes: Array(1) ← SI CECI EST undefined, c'est le problème
     Codes count: 1
   ```

---

## 🔍 Diagnostic

### Cas A: Les codes s'affichent après assignation mais disparaissent à la réouverture

**Symptôme** :
```
=== REFRESHED ORDER AFTER AUTO-ASSIGN ===
  giftCardCodes: Array(1)  ✅ Codes présents
  Codes count: 1

[Ferme et rouvre]

=== OPENING ORDER DETAILS ===
  giftCardCodes: undefined  ❌ Codes disparus
  Codes count: 0
```

**Cause** : La liste des orders (`orders` state) n'est pas mise à jour après l'assignation. Quand vous rouvrez, ça reprend l'ancien order de la liste qui n'a pas les codes.

**Solution** : Rafraîchir aussi la liste des orders après assignation :

```typescript
// Dans handleAutoAssignCodes (ligne ~288)
setSelectedOrder(refreshedOrder);

// ✅ AJOUTER CECI
loadOrders(currentPage, false);  // Rafraîchir la liste
```

---

### Cas B: Les codes ne s'affichent jamais, même après assignation

**Symptôme** :
```
=== REFRESHED ORDER AFTER AUTO-ASSIGN ===
  giftCardCodes: undefined  ❌
  Codes count: 0
```

**Cause** : Le backend ne retourne pas les codes dans `GET /admin/orders/:orderId`

**Solution** : Vérifier la réponse backend avec curl :

```bash
# Récupérer un token admin
TOKEN="votre-token-ici"

# Tester GET /admin/orders/:orderId
curl -X GET "https://yucard.generale-ci.com/api/admin/orders/e21c839a-3472-4fb8-833d-b3c1f7bb4fec" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.items[0].giftCardCodes'

# Devrait retourner
[
  {
    "id": "...",
    "code": "21312324343555455454",
    "amount": "7500",
    "status": "ACTIVE",
    ...
  }
]
```

---

### Cas C: Le backend retourne bien les codes mais le type ne correspond pas

**Symptôme** : Console log montre un objet mais avec des propriétés différentes

**Vérifier** :
```javascript
console.log('giftCardCodes:', item.giftCardCodes);
// Si vous voyez: { codes: [...] } au lieu de [...]
// → Le backend retourne les codes dans une propriété nested
```

**Solution** : Adapter le mapping dans `adminOrdersService.ts` :

```typescript
// Si le backend retourne { codes: [...] }
async getOrderDetails(orderId: string): Promise<AdminOrder> {
  const order = await apiClient.get<any>(`/admin/orders/${orderId}`);

  // Mapper les codes correctement
  order.items = order.items.map(item => ({
    ...item,
    giftCardCodes: item.giftCardCodes || item.codes || []  // Essayer plusieurs propriétés
  }));

  return order;
}
```

---

## ✅ Fix le plus probable : Rafraîchir la liste

Le problème le plus courant est le **Cas A**. La solution :

### Dans `handleAutoAssignCodes` (ligne ~288)

**AVANT** :
```typescript
setSelectedOrder(refreshedOrder);
```

**APRÈS** :
```typescript
setSelectedOrder(refreshedOrder);

// Rafraîchir aussi la liste pour que la prochaine ouverture ait les codes
loadOrders(currentPage, false);
```

### Dans `handleManualAssignCode` (ligne ~345)

**AVANT** :
```typescript
setSelectedOrder(refreshedOrder);
```

**APRÈS** :
```typescript
setSelectedOrder(refreshedOrder);

// Rafraîchir aussi la liste
loadOrders(currentPage, false);
```

---

## 🧪 Test après le fix

1. Assigner des codes
2. **Vérifier console** : codes présents après assignation ✅
3. Fermer le modal
4. Rouvrir le même order
5. **Vérifier console** : codes toujours présents ✅
6. **Vérifier UI** : Les codes s'affichent ✅

---

## 🗑️ Nettoyer les logs après debug

Une fois le problème résolu, retirer tous les `console.log` de debug :

```bash
# Chercher tous les logs de debug
grep -n "🔍 DEBUG" app/(admintabs)/orders.tsx

# Les supprimer manuellement ou avec sed
```

---

## 📊 Résumé

| Scénario | Logs après assign | Logs à réouverture | Cause | Fix |
|----------|-------------------|-------------------|-------|-----|
| A | ✅ codes présents | ❌ codes absents | Liste pas rafraîchie | `loadOrders()` |
| B | ❌ codes absents | ❌ codes absents | Backend ne les retourne pas | Vérifier backend include |
| C | ⚠️ structure différente | ⚠️ structure différente | Mapping incorrect | Adapter le service |

Le plus probable est le **Cas A** → Ajoutez `loadOrders(currentPage, false)` après chaque assignation.

---

Lancez l'app et testez, puis envoyez-moi les logs de la console !
