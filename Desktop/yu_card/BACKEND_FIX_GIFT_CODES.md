# 🐛 Fix: Codes gift cards non affichés après assignation

## Problème

Quand un admin assigne des codes à une commande et ferme/rouvre les détails, **les codes ne s'affichent pas** et le système redemande de les assigner.

## Cause racine

Le backend `GET /api/admin/orders/:orderId` ne retourne pas les codes assignés dans le champ `giftCardCodes` des items.

---

## ✅ Solution : Inclure les GiftCardCodes dans la réponse

### Structure attendue par le frontend

```typescript
interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: 'GIFT_CARD' | 'PHYSICAL_PRODUCT';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftCardCodes?: GiftCardCode[];  // ⚠️ DOIT être inclus ici
}

interface GiftCardCode {
  id: string;
  code: string;
  amount: number;
  status: 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  activationDate?: string;
  expiryDate?: string;
  usedAt?: string;
}
```

---

## 📝 Code à modifier dans le backend

### Fichier: `admin.controller.ts` → `getOrderById()`

**Actuellement** (ligne ~644-747), vous avez probablement :

```typescript
async getOrderById(orderId: string): Promise<AdminOrderResponse> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          // ❌ MANQUE: giftCardCodes
        }
      },
      wavePayments: true,
      shippingAddress: true,
      tracking: true
    }
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return {
    success: true,
    data: this.formatOrderResponse(order)
  };
}
```

**À CORRIGER** :

```typescript
async getOrderById(orderId: string): Promise<AdminOrderResponse> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true
            }
          },
          // ✅ AJOUT IMPORTANT: Inclure les codes gift cards
          giftCardCodes: {
            where: {
              status: {
                not: 'CANCELLED'  // Exclure les codes annulés
              }
            },
            select: {
              id: true,
              code: true,
              amount: true,
              status: true,
              activationDate: true,
              expiryDate: true,
              usedAt: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'asc'  // Trier par date d'assignation
            }
          }
        }
      },
      wavePayments: {
        orderBy: { createdAt: 'desc' }
      },
      shippingAddress: true,
      tracking: true
    }
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return {
    success: true,
    data: this.formatOrderResponse(order)
  };
}
```

---

## 📊 Exemple de réponse correcte

### Avant le fix (codes manquants) ❌

```json
{
  "success": true,
  "data": {
    "id": "e21c839a-3472-4fb8-833d-b3c1f7bb4fec",
    "orderNumber": "YC1759547998010",
    "items": [
      {
        "id": "item-uuid",
        "productName": "PlayStation Plus 12 mois",
        "productType": "GIFT_CARD",
        "quantity": 2,
        "unitPrice": 25000,
        "totalPrice": 50000
        // ❌ Pas de giftCardCodes
      }
    ]
  }
}
```

### Après le fix (codes inclus) ✅

```json
{
  "success": true,
  "data": {
    "id": "e21c839a-3472-4fb8-833d-b3c1f7bb4fec",
    "orderNumber": "YC1759547998010",
    "items": [
      {
        "id": "item-uuid",
        "productName": "PlayStation Plus 12 mois",
        "productType": "GIFT_CARD",
        "quantity": 2,
        "unitPrice": 25000,
        "totalPrice": 50000,
        "giftCardCodes": [  // ✅ Codes inclus
          {
            "id": "code-uuid-1",
            "code": "PSN1-XXXX-YYYY-ZZZZ",
            "amount": 25000,
            "status": "ACTIVE",
            "activationDate": "2025-10-04T15:30:00Z",
            "expiryDate": "2026-10-04T15:30:00Z"
          },
          {
            "id": "code-uuid-2",
            "code": "PSN2-AAAA-BBBB-CCCC",
            "amount": 25000,
            "status": "ACTIVE",
            "activationDate": "2025-10-04T15:31:00Z",
            "expiryDate": "2026-10-04T15:31:00Z"
          }
        ]
      }
    ]
  }
}
```

---

## 🔍 Vérification

### Test 1 : Assigner des codes

```bash
# 1. Assigner des codes
POST /api/admin/orders/e21c839a-3472-4fb8-833d-b3c1f7bb4fec/assign-codes

# Response attendue
{
  "success": true,
  "message": "All codes assigned successfully",
  "data": {
    "results": [
      {
        "orderItemId": "...",
        "giftCard": "PlayStation Plus 12 mois",
        "status": "assigned",
        "codesCount": 2
      }
    ],
    "errors": []
  }
}
```

### Test 2 : Récupérer les détails avec les codes

```bash
# 2. Récupérer les détails
GET /api/admin/orders/e21c839a-3472-4fb8-833d-b3c1f7bb4fec

# Response attendue - DOIT INCLURE giftCardCodes
{
  "success": true,
  "data": {
    "items": [
      {
        "productType": "GIFT_CARD",
        "giftCardCodes": [  // ⚠️ VÉRIFIER que ce champ existe
          { "code": "...", "status": "ACTIVE", ... }
        ]
      }
    ]
  }
}
```

---

## 🧪 Test avec console.log

Ajoutez temporairement dans le frontend pour débugger :

```typescript
// Dans orders.tsx, ligne ~272 (handleAutoAssignCodes)
if (selectedOrder) {
  const refreshedOrder = await adminOrdersService.getOrderDetails(orderId);

  // 🔍 DEBUG
  console.log('=== REFRESHED ORDER ===');
  console.log('Full order:', JSON.stringify(refreshedOrder, null, 2));

  refreshedOrder.items.forEach((item, idx) => {
    console.log(`Item ${idx}:`, item.productName);
    console.log(`  - Type: ${item.productType}`);
    console.log(`  - giftCardCodes:`, item.giftCardCodes);
    console.log(`  - Codes count:`, item.giftCardCodes?.length || 0);
  });

  setSelectedOrder(refreshedOrder);
}
```

**Résultat attendu dans la console** :

```
=== REFRESHED ORDER ===
Item 0: PlayStation Plus 12 mois
  - Type: GIFT_CARD
  - giftCardCodes: Array(2)
  - Codes count: 2
```

**Si vous voyez** :

```
  - giftCardCodes: undefined
  - Codes count: 0
```

→ Le backend ne retourne pas les codes, il faut ajouter l'include.

---

## 🗄️ Schéma Prisma (pour référence)

Assurez-vous que votre schéma Prisma a bien la relation :

```prisma
model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  productId       String
  productName     String
  productType     ProductType
  quantity        Int
  unitPrice       Decimal  @db.Decimal(10, 2)
  totalPrice      Decimal  @db.Decimal(10, 2)

  // Relations
  order           Order    @relation(fields: [orderId], references: [id])
  product         Product  @relation(fields: [productId], references: [id])
  giftCardCodes   GiftCardCode[]  // ✅ Cette relation doit exister

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model GiftCardCode {
  id              String   @id @default(uuid())
  orderItemId     String
  code            String   @unique
  amount          Decimal  @db.Decimal(10, 2)
  status          GiftCardCodeStatus  @default(PENDING)
  activationDate  DateTime?
  expiryDate      DateTime?
  usedAt          DateTime?

  // Relations
  orderItem       OrderItem @relation(fields: [orderItemId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 📋 Checklist

- [ ] Ajouter `giftCardCodes` dans l'include de `getOrderById()`
- [ ] Filtrer les codes `status != 'CANCELLED'`
- [ ] Trier les codes par `createdAt ASC`
- [ ] Tester avec Postman : `GET /admin/orders/:orderId`
- [ ] Vérifier que `giftCardCodes` existe dans la réponse
- [ ] Tester dans le frontend : assigner → fermer → rouvrir
- [ ] Vérifier que les codes s'affichent après réouverture
- [ ] Retirer les console.log de debug

---

## 🎯 Impact après le fix

### Avant ❌
1. Admin assigne 2 codes
2. Ferme les détails
3. Rouvre les détails
4. **Les codes ne s'affichent pas**
5. Le système redemande d'assigner

### Après ✅
1. Admin assigne 2 codes
2. Ferme les détails
3. Rouvre les détails
4. **Les codes s'affichent : "2/2 code(s) assigné(s)"**
5. Plus besoin de réassigner

---

## 💡 Amélioration bonus

Ajoutez également `giftCardCodes` dans `getAllOrders()` pour afficher un indicateur dans la liste :

```typescript
async getAllOrders(params: OrderQueryParams) {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true,
          giftCardCodes: {  // ✅ Aussi ici
            where: { status: { not: 'CANCELLED' } }
          }
        }
      }
    }
  });

  return orders;
}
```

Cela permettra d'afficher dans la liste des commandes :
- "✅ Codes assignés (2/2)" si tous les codes sont là
- "⏳ Codes manquants (0/2)" si aucun code
- "⚠️ Codes partiels (1/2)" si incomplet

---

Voulez-vous que je vous aide à implémenter ce fix dans le backend yu-card-backend ?
