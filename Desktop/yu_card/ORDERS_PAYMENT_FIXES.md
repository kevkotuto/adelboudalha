# Orders & Payment Status - Corrections et Améliorations

## Problèmes résolus

### 1. ❌ Problème : Pas de filtre pour les commandes payées
**Solution** : Ajout du filtre "💳 Payées" qui filtre sur `paymentStatus = COMPLETED`

### 2. ❌ Problème : Impossible de marquer une commande comme payée (cash)
**Solution** : Ajout du bouton "💵 Marquer comme payé (Cash)" dans les détails de commande

### 3. ❌ Problème : Backend renvoie `success: false` pour attribution réussie
**Solution** : Gestion spéciale dans `assignCodes()` pour parser la réponse même en cas de `success: false`

---

## Modifications détaillées

### 📁 File: `app/(admintabs)/orders.tsx`

#### A. Ajout du filtre "Payées"

```typescript
const statusFilters = [
  { key: 'all', label: 'Toutes', color: Colors.text.secondary },
  { key: 'PENDING', label: 'En attente', color: '#FF9800' },
  { key: 'CONFIRMED', label: 'Confirmées', color: '#2196F3' },
  { key: 'COMPLETED', label: '💳 Payées', color: '#4CAF50', isPaymentFilter: true }, // ← NOUVEAU
  { key: 'PROCESSING', label: 'En cours', color: '#9C27B0' },
  { key: 'SHIPPED', label: 'Expédiées', color: '#673AB7' },
  { key: 'DELIVERED', label: 'Livrées', color: '#4CAF50' },
  { key: 'CANCELLED', label: 'Annulées', color: '#f44336' },
];
```

#### B. Logique de filtrage intelligente

```typescript
if (selectedStatus !== 'all') {
  const filter = statusFilters.find(f => f.key === selectedStatus);
  if (filter?.isPaymentFilter) {
    params.paymentStatus = selectedStatus; // Filtre sur paymentStatus
  } else {
    params.status = selectedStatus; // Filtre sur status
  }
}
```

#### C. Affichage du statut de paiement

Ajout d'une ligne dans les détails de commande :

```typescript
<View style={styles.infoRow}>
  <Caption style={styles.infoLabel}>Statut de paiement</Caption>
  <View style={[styles.statusBadge, { backgroundColor: ... }]}>
    <Caption style={styles.statusText}>
      {paymentStatus === 'COMPLETED' ? '💳 Payée'
       : paymentStatus === 'PENDING' ? '⏳ En attente'
       : paymentStatus === 'FAILED' ? '❌ Échoué'
       : paymentStatus}
    </Caption>
  </View>
</View>
```

#### D. Bouton "Marquer comme payé (Cash)"

```typescript
{selectedOrder.paymentStatus !== 'COMPLETED' && (
  <Button
    variant="primary"
    size="sm"
    onPress={() => handleMarkAsPaid(selectedOrder.id)}
    style={{ marginTop: Spacing.sm }}
  >
    💵 Marquer comme payé (Cash)
  </Button>
)}
```

#### E. Fonction handleMarkAsPaid

```typescript
const handleMarkAsPaid = useCallback(async (orderId: string) => {
  Alert.alert(
    'Confirmer le paiement',
    'Marquer cette commande comme payée (paiement cash) ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        onPress: async () => {
          try {
            const updatedOrder = await adminOrdersService.updatePaymentStatus(
              orderId,
              'COMPLETED'
            );

            setSelectedOrder(updatedOrder);
            loadOrders(1, true);

            Alert.alert('Succès', 'Le paiement a été confirmé');
          } catch (error: any) {
            console.error('[Orders] Error marking as paid:', error);
            Alert.alert('Erreur', error?.message || 'Impossible de confirmer le paiement');
          }
        },
      },
    ]
  );
}, [loadOrders]);
```

---

### 📁 File: `services/adminOrdersService.ts`

#### A. Nouvelle méthode updatePaymentStatus

```typescript
/**
 * Update payment status (for cash payments)
 * PATCH /api/admin/orders/:orderId/payment-status
 */
async updatePaymentStatus(
  orderId: string,
  paymentStatus: string
): Promise<AdminOrder> {
  try {
    const order = await apiClient.patch<AdminOrder>(
      `/admin/orders/${orderId}/payment-status`,
      { paymentStatus }
    );
    return order;
  } catch (error) {
    console.error('[AdminOrdersService] Error updating payment status:', error);
    throw error;
  }
}
```

#### B. Fix pour assignCodes - Backend inconsistency

Le backend renvoie parfois `success: false` même quand l'attribution fonctionne. Solution :

```typescript
async assignCodes(orderId: string): Promise<AssignCodesResult> {
  try {
    const result = await apiClient.post<AssignCodesResult>(
      `/admin/orders/${orderId}/assign-codes`
    );
    return result;
  } catch (error: any) {
    // Backend may return success=false with valid data structure
    // Check if error response contains valid AssignCodesResult structure
    if (error?.response?.data?.data) {
      const data = error.response.data.data;
      // If it has the expected structure (results and errors arrays), return it
      if (Array.isArray(data.results) && Array.isArray(data.errors)) {
        console.log('[AdminOrdersService] Backend returned success=false but valid data, using it');
        return data as AssignCodesResult;
      }
    }

    console.error('[AdminOrdersService] Error assigning codes:', error);
    throw error;
  }
}
```

**Explication** :
1. Le backend renvoie `success: false` avec `message: "All codes assigned successfully"`
2. L'apiClient lance une exception car `success: false`
3. On attrape l'exception et on vérifie si la structure de données est valide
4. Si `results` et `errors` sont des arrays, on retourne les données
5. Sinon, on relance l'exception

---

## Workflow complet : Commande avec paiement cash

### Scénario d'utilisation

1. **Client passe commande**
   - `status: PENDING`
   - `paymentStatus: PENDING`

2. **Admin confirme la commande**
   - Clique sur "Confirmer la commande"
   - `status: CONFIRMED`
   - `paymentStatus: PENDING` (toujours en attente)

3. **Client paye en cash**
   - Admin ouvre les détails de la commande
   - Voit "Statut de paiement: ⏳ En attente"
   - Clique sur "💵 Marquer comme payé (Cash)"
   - Confirme
   - `paymentStatus: COMPLETED`

4. **Attribution des codes gift cards**
   - Section "Gift Card Codes Management" devient visible
   - Admin peut maintenant :
     - **Option A** : Cliquer sur "Attribuer depuis l'inventory" (auto)
     - **Option B** : Saisir manuellement les codes un par un

5. **Expédition**
   - Clique sur "Marquer en cours" → `status: PROCESSING`
   - Clique sur "Marquer comme expédiée" → `status: SHIPPED`
   - Clique sur "Marquer comme livrée" → `status: DELIVERED`

---

## Interface utilisateur

### Filtres disponibles

```
┌─────────────────────────────────────────────────────────────┐
│ [Toutes] [En attente] [Confirmées] [💳 Payées] [En cours] │
│ [Expédiées] [Livrées] [Annulées]                           │
└─────────────────────────────────────────────────────────────┘
```

### Détails de commande - Avant paiement

```
┌──────────────────────────────────────┐
│ Informations de la commande         │
├──────────────────────────────────────┤
│ Statut: [CONFIRMED]                  │
│ Numéro: #ORD-12345                   │
│ Date: 04/10/2025 15:30               │
│ Montant: 50 000 FCFA                 │
│ Statut de paiement: [⏳ En attente]  │
│                                      │
│ [💵 Marquer comme payé (Cash)]       │
└──────────────────────────────────────┘
```

### Détails de commande - Après paiement

```
┌──────────────────────────────────────┐
│ Informations de la commande         │
├──────────────────────────────────────┤
│ Statut de paiement: [💳 Payée]       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Articles (2)                         │
├──────────────────────────────────────┤
│ PlayStation Plus 12 mois [Gift Card] │
│ Quantité: 1 x 25 000 FCFA            │
│                                      │
│ ⚠️ 1 code(s) à attribuer             │
│                                      │
│ 💡 Astuce: Importez d'abord des codes│
│    dans l'onglet 'Codes Gift Cards'  │
│                                      │
│ [Attribuer depuis l'inventory]       │
│              OU                       │
│ [___________________]                 │
│ [Saisir manuellement]                │
└──────────────────────────────────────┘
```

---

## API Endpoints utilisés

### 1. Filtrer les commandes payées
```
GET /api/admin/orders?paymentStatus=COMPLETED
```

### 2. Marquer comme payé
```
PATCH /api/admin/orders/:orderId/payment-status
Body: { "paymentStatus": "COMPLETED" }
```

### 3. Attribuer codes automatiquement
```
POST /api/admin/orders/:orderId/assign-codes
Response: {
  "success": false, // ⚠️ Bug backend
  "message": "All codes assigned successfully",
  "data": {
    "results": [...],
    "errors": []
  }
}
```

---

## Tests à effectuer

### ✅ Test 1 : Filtre "Payées"
1. Aller dans Orders
2. Cliquer sur le filtre "💳 Payées"
3. Vérifier que seules les commandes avec `paymentStatus: COMPLETED` s'affichent

### ✅ Test 2 : Marquer comme payé
1. Créer une commande de test
2. Ouvrir les détails
3. Vérifier que le statut est "⏳ En attente"
4. Cliquer sur "💵 Marquer comme payé (Cash)"
5. Confirmer
6. Vérifier que le statut passe à "💳 Payée"
7. Vérifier que la section d'attribution de codes est maintenant visible

### ✅ Test 3 : Attribution automatique
1. Importer des codes dans l'onglet "Codes Gift Cards"
2. Revenir à la commande
3. Cliquer sur "Attribuer depuis l'inventory"
4. Vérifier qu'aucune erreur ne s'affiche
5. Vérifier que les codes sont assignés

### ✅ Test 4 : Attribution manuelle
1. Ouvrir une commande payée avec gift card
2. Saisir un code manuellement dans l'input
3. Cliquer sur "Saisir manuellement"
4. Vérifier que le code est enregistré
5. Vérifier le compteur de progression (1/2, 2/2)

---

## Notes importantes

### ⚠️ Backend inconsistency
Le backend renvoie `success: false` avec `message: "All codes assigned successfully"`. C'est une incohérence qui a été contournée dans le service.

**Recommandation** : Le backend devrait renvoyer `success: true` quand l'attribution fonctionne.

### 💡 Amélioration future
Ajouter un filtre combiné "Payées + GIFT_CARD" pour voir directement les commandes nécessitant une attribution de codes.

---

## Résumé des changements

| Fichier | Lignes modifiées | Type de changement |
|---------|------------------|-------------------|
| `app/(admintabs)/orders.tsx` | +60 | Ajout filtre + bouton + fonction |
| `services/adminOrdersService.ts` | +35 | Nouvelle méthode + fix backend |

**Total** : ~95 lignes ajoutées/modifiées

---

## Conclusion

✅ Les admins peuvent maintenant :
1. Filtrer les commandes payées facilement
2. Marquer manuellement une commande comme payée (cash)
3. Voir clairement le statut de paiement
4. Attribuer des codes uniquement pour les commandes payées
5. Gérer les incohérences du backend automatiquement

**Impact utilisateur** : Interface plus claire et workflow complet pour les paiements cash.
