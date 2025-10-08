# 🎁 Gift Card Codes - Workflow Complet & Détaillé

## 📋 Vue d'ensemble

Le système de gift cards utilise un **inventory de codes réels** que l'admin peut attribuer de **deux manières** :
1. **Attribution automatique** depuis le stock (batch)
2. **Saisie manuelle** code par code

### Flux de travail global

```
┌─────────────┐
│ 1. Admin    │ Import CSV codes → Inventory
│ Setup       │ OU prépare codes manuels
└──────┬──────┘
       │
┌──────▼──────┐
│ 2. Client   │ Ajoute gift card → Panier → Commande → Paie Wave
│ Commande    │
└──────┬──────┘
       │
┌──────▼──────┐
│ 3. Paiement │ Job vérifie (30s) → Paiement OK
│ Confirmé    │ → Notification client + admin
└──────┬──────┘
       │
┌──────▼──────────────────────────┐
│ 4. Admin attribue codes         │
│   ┌─────────────────────────┐   │
│   │ Option A: Auto (batch)  │   │ 1 clic → Tous codes assignés
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │ Option B: Manuel (1 à 1)│   │ Saisie code → Répéter
│   └─────────────────────────┘   │
└──────┬──────────────────────────┘
       │
┌──────▼──────┐
│ 5. Client   │ Reçoit notification avec codes
│ Reçoit      │ Peut voir codes dans app
└─────────────┘
```

---

## 🔧 PARTIE 1 : Configuration Admin

### Étape 1.1 : Créer une Gift Card

**Route** :
```http
POST /api/admin/gift-cards
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body** :
```json
{
  "title": "PlayStation Network 20€",
  "brand": "PlayStation",
  "categoryId": "uuid-category",
  "description": "Carte cadeau PSN valable en France",
  "minAmount": 14500,
  "maxAmount": 14500,
  "fixedAmounts": [14500],
  "currency": "XOF",
  "discountPercentage": 0,
  "validityDays": 365,
  "region": "FR",
  "isActive": true,
  "imageUrl": "https://cdn.example.com/psn.png"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "giftCard": {
      "id": "gc-uuid-123",
      "title": "PlayStation Network 20€",
      "brand": "PlayStation",
      "slug": "playstation-network-20-euro",
      "isActive": true
    }
  }
}
```

---

### Étape 1.2 : Importer des codes en CSV (Optionnel pour Option A)

**Format CSV** (un code par ligne, sans header) :
```csv
PSN1-XXXX-YYYY-ZZZZ
PSN2-AAAA-BBBB-CCCC
PSN3-DDDD-EEEE-FFFF
PSN4-GGGG-HHHH-IIII
PSN5-JJJJ-KKKK-LLLL
```

**Route** :
```http
POST /api/admin/gift-cards/{giftCardId}/codes/import
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Form Data** :
- `file`: codes.csv

**Réponse** :
```json
{
  "success": true,
  "message": "Imported 50 codes successfully",
  "data": {
    "imported": 50,
    "duplicates": 0,
    "total": 50
  }
}
```

**Ce qui se passe** :
1. ✅ Parse le CSV ligne par ligne
2. ✅ Vérifie doublons dans la DB
3. ✅ Crée records dans `GiftCardInventory` avec status `AVAILABLE`
4. ✅ Skip les doublons automatiquement

---

### Étape 1.3 : Vérifier le stock disponible

**Route** :
```http
GET /api/admin/gift-cards/inventory/summary
Authorization: Bearer {admin_token}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "giftCards": [
      {
        "giftCardId": "gc-uuid-123",
        "title": "PlayStation Network 20€",
        "brand": "PlayStation",
        "imageUrl": "https://...",
        "availableCount": 50
      },
      {
        "giftCardId": "gc-uuid-456",
        "title": "iTunes 50€",
        "brand": "Apple",
        "availableCount": 0      // Out of stock
      }
    ],
    "alerts": {
      "lowStock": [
        {
          "giftCardId": "gc-uuid-789",
          "title": "Xbox 10€",
          "availableCount": 5    // < 10 codes
        }
      ],
      "outOfStock": [
        {
          "giftCardId": "gc-uuid-456",
          "title": "iTunes 50€",
          "availableCount": 0
        }
      ]
    }
  }
}
```

---

### Étape 1.4 : Voir inventory d'une gift card spécifique

**Route** :
```http
GET /api/admin/gift-cards/{giftCardId}/inventory?status=AVAILABLE&page=1&limit=50
Authorization: Bearer {admin_token}
```

**Query Parameters** :
- `status` : `ALL` | `AVAILABLE` | `RESERVED` | `ASSIGNED` | `USED` | `EXPIRED` | `CANCELLED`
- `page` : Numéro de page (défaut: 1)
- `limit` : Items par page (défaut: 50)

**Réponse** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "inv-uuid-1",
        "code": "PSN1-XXXX-YYYY-ZZZZ",
        "status": "AVAILABLE",
        "createdAt": "2025-10-01T10:00:00Z",
        "orderItem": null,
        "admin": null
      },
      {
        "id": "inv-uuid-2",
        "code": "PSN2-AAAA-BBBB-CCCC",
        "status": "ASSIGNED",
        "assignedAt": "2025-10-04T14:30:00Z",
        "orderItem": {
          "id": "item-uuid",
          "orderId": "order-uuid",
          "order": {
            "orderNumber": "YC1234567890",
            "user": {
              "fullName": "John Doe",
              "phone": "+2250700000000"
            }
          }
        },
        "admin": {
          "id": "admin-uuid",
          "fullName": "Admin User"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    },
    "stats": {
      "AVAILABLE": 48,
      "ASSIGNED": 2,
      "USED": 0
    }
  }
}
```

---

## 🛒 PARTIE 2 : Commande Client

### Étape 2.1 : Ajouter gift card au panier

**Route** :
```http
POST /api/cart/items
Authorization: Bearer {client_token}
Content-Type: application/json
```

**Body** :
```json
{
  "productType": "GIFT_CARD",
  "giftCardId": "gc-uuid-123",
  "giftCardAmount": 14500,
  "quantity": 2
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "cartItem": {
      "id": "cart-item-uuid",
      "productType": "GIFT_CARD",
      "quantity": 2,
      "giftCardAmount": 14500
    }
  }
}
```

---

### Étape 2.2 : Créer la commande

**Route** :
```http
POST /api/orders
Authorization: Bearer {client_token}
Content-Type: application/json
```

**Body** :
```json
{
  "paymentMethod": "WAVE",
  "contactPhone": "+2250500808585",
  "shippingAddressId": "addr-uuid",  // Optionnel pour gift cards
  "billingAddressId": "addr-uuid",   // Optionnel
  "notes": "Livraison codes par email"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid-abc",
      "orderNumber": "YC1234567890",
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "totalAmount": 29000,
      "items": [
        {
          "id": "item-uuid-1",
          "productType": "GIFT_CARD",
          "productName": "PlayStation Network 20€",
          "productBrand": "PlayStation",
          "quantity": 2,
          "unitPrice": 14500,
          "giftCardAmount": 14500,
          "totalPrice": 29000
        }
      ]
    },
    "payment": {
      "waveCheckoutUrl": "https://checkout.wave.com/...",
      "waveReference": "wave-ref-123"
    }
  }
}
```

**Ce qui se passe** :
1. ✅ Récupère tous les items du panier
2. ✅ Valide chaque gift card (active, montant min/max)
3. ✅ Crée Order avec status `PENDING`
4. ✅ Crée OrderItems avec `productType: "GIFT_CARD"`
5. ✅ Crée WavePayment avec status `PENDING`
6. ✅ Vide le panier
7. ✅ Retourne URL Wave pour paiement
8. ❌ **NE crée PAS encore les codes** (attente paiement)

---

### Étape 2.3 : Paiement Wave

Le client paie via l'URL Wave. Rien à faire côté API, c'est Wave qui gère.

**Job automatique** (`src/jobs/payment-verification.job.ts`) :
- ⏱️ Tourne toutes les **30 secondes**
- 🔍 Vérifie tous les paiements avec status `PENDING` ou `PROCESSING`
- 📡 Appelle l'API Wave pour vérifier le statut réel
- ✅ Si paiement réussi :
  - Met à jour `WavePayment.status = "SUCCESS"`
  - Met à jour `Order.paymentStatus = "COMPLETED"`
  - Met à jour `Order.status = "CONFIRMED"`
  - Traite les récompenses de parrainage
  - **Envoie notifications**

---

## 📧 PARTIE 3 : Notifications Automatiques

### Notification 3.1 : Paiement confirmé (Client)

Envoyée automatiquement par le job quand `payment_status = "successful"`.

**Canaux** :
1. **SMS** (Termii)
2. **Push Notification** (Expo)
3. **In-App Notification**

**Message** :
```
Paiement confirmé !
Paiement de 29,000 XOF confirmé.
Vos codes gift card seront attribués sous peu.
```

---

### Notification 3.2 : Action requise (Admin)

Envoyée automatiquement par le job pour **tous les admins** si la commande contient des gift cards.

**Route appelée** : `OrderNotificationService.notifyAdminPendingCodeAssignment(orderId)`

**Canaux** :
1. **Push Notification** (Expo) - pour admins avec token
2. **In-App Notification** - pour tous les admins

**Message** :
```
🔔 Codes à attribuer
Commande YC1234567890 en attente d'attribution de codes:
PlayStation Network 20€
```

**Données notification** :
```json
{
  "title": "🔔 Codes à attribuer",
  "message": "Commande YC1234567890 en attente...",
  "type": "ADMIN_ACTION_REQUIRED",
  "data": {
    "orderId": "order-uuid-abc",
    "orderNumber": "YC1234567890",
    "action": "ASSIGN_CODES"
  }
}
```

---

## 👨‍💼 PARTIE 4 : Attribution des Codes (Admin)

### Option A : Attribution Automatique (Batch)

**Quand utiliser** : Quand les codes sont déjà dans l'inventory (import CSV fait)

#### Étape 4A.1 : Voir les commandes en attente

**Route** :
```http
GET /api/admin/orders?paymentStatus=COMPLETED&status=CONFIRMED&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order-uuid-abc",
        "orderNumber": "YC1234567890",
        "status": "CONFIRMED",
        "paymentStatus": "COMPLETED",
        "totalAmount": 29000,
        "user": {
          "fullName": "John Doe",
          "phone": "+2250700000000"
        },
        "items": [
          {
            "productType": "GIFT_CARD",
            "productName": "PlayStation Network 20€",
            "quantity": 2
          }
        ]
      }
    ]
  }
}
```

#### Étape 4A.2 : Attribuer tous les codes automatiquement

**Route** :
```http
POST /api/admin/orders/{orderId}/assign-codes
Authorization: Bearer {admin_token}
```

**Ce qui se passe** (Controller: `assignCodesToOrder`) :
1. ✅ Récupère la commande avec tous les items GIFT_CARD
2. ✅ Vérifie `paymentStatus === "COMPLETED"`
3. ✅ Pour chaque OrderItem :
   - Calcule combien de codes manquent : `quantity - giftCardCodes.length`
   - Cherche codes AVAILABLE dans inventory : `findMany({ status: 'AVAILABLE', giftCardId, take: needed })`
   - Si pas assez → Erreur "Insufficient codes"
   - Si assez → Transaction :
     - Met à jour inventory codes : `status: ASSIGNED`, `orderItemId`, `assignedBy`, `assignedAt`
     - Crée GiftCardCode pour le client : `status: ACTIVE`, `activationDate`, `expiryDate`
4. ✅ Envoie notification client si tous les codes assignés

**Réponse Success** :
```json
{
  "success": true,
  "message": "All codes assigned successfully",
  "data": {
    "results": [
      {
        "orderItemId": "item-uuid-1",
        "giftCard": "PlayStation Network 20€",
        "status": "assigned",
        "codesCount": 2
      }
    ],
    "errors": []
  }
}
```

**Réponse avec erreurs** :
```json
{
  "success": false,
  "message": "Some codes could not be assigned",
  "data": {
    "results": [],
    "errors": [
      {
        "orderItemId": "item-uuid-1",
        "giftCard": "PlayStation Network 20€",
        "needed": 2,
        "available": 0,
        "error": "Insufficient codes in inventory"
      }
    ]
  }
}
```

---

### Option B : Saisie Manuelle Code par Code

**Quand utiliser** : Quand les codes ne sont PAS dans l'inventory OU pour attribution personnalisée

#### Étape 4B.1 : Récupérer les détails de la commande

**Route** :
```http
GET /api/admin/orders/{orderId}/codes
Authorization: Bearer {admin_token}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid-abc",
    "orderNumber": "YC1234567890",
    "paymentStatus": "COMPLETED",
    "items": [
      {
        "orderItemId": "item-uuid-1",
        "giftCard": {
          "id": "gc-uuid-123",
          "title": "PlayStation Network 20€",
          "brand": "PlayStation",
          "imageUrl": "https://..."
        },
        "quantity": 2,
        "assignedCodes": 0,    // 0 codes assignés
        "codes": [],           // Vide
        "inventoryDetails": []
      }
    ]
  }
}
```

#### Étape 4B.2 : Saisir le premier code

**Route** :
```http
POST /api/admin/order-items/{orderItemId}/assign-code
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body** :
```json
{
  "code": "PSN1-XXXX-YYYY-ZZZZ"
}
```

**Ce qui se passe** (Controller: `assignManualCodeToItem`) :
1. ✅ Récupère OrderItem + Order + GiftCard
2. ✅ Vérifie `paymentStatus === "COMPLETED"`
3. ✅ Vérifie que pas tous les codes déjà assignés
4. ✅ Vérifie si code existe :
   - Dans `GiftCardCode` → Erreur "CODE_ALREADY_ASSIGNED"
   - Dans `GiftCardInventory` avec status != AVAILABLE → Erreur "CODE_NOT_AVAILABLE"
   - Dans `GiftCardInventory` avec status = AVAILABLE → OK, on utilise
   - Nulle part → OK, on crée
5. ✅ Transaction :
   - Si code pas dans inventory → Crée avec `status: ASSIGNED`, `notes: "Manually entered by admin"`
   - Si code dans inventory → Update `status: ASSIGNED`
   - Crée GiftCardCode pour client : `status: ACTIVE`, `inventoryCodeId`, etc.
6. ✅ Vérifie si tous les codes de la commande assignés → Notifie client

**Réponse** :
```json
{
  "success": true,
  "message": "Code assigned successfully",
  "data": {
    "code": "PSN1-XXXX-YYYY-ZZZZ",
    "status": "ACTIVE",
    "itemComplete": false,     // ❌ Item pas encore complet
    "remaining": 1,            // 1 code manquant
    "totalRequired": 2,
    "totalAssigned": 1         // 1/2 codes assignés
  }
}
```

#### Étape 4B.3 : Saisir le deuxième code

**Request** :
```http
POST /api/admin/order-items/{orderItemId}/assign-code

{
  "code": "PSN2-AAAA-BBBB-CCCC"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Code assigned successfully",
  "data": {
    "code": "PSN2-AAAA-BBBB-CCCC",
    "status": "ACTIVE",
    "itemComplete": true,      // ✅ Item complet !
    "remaining": 0,
    "totalRequired": 2,
    "totalAssigned": 2         // 2/2 codes assignés
  }
}
```

**🎉 Notification client envoyée automatiquement** si TOUS les items de la commande sont complets !

---

## 📱 PARTIE 5 : Récupération Codes (Client)

### Étape 5.1 : Voir mes codes

**Route** :
```http
GET /api/gift-cards/codes/my-codes?status=ACTIVE&page=1&limit=20
Authorization: Bearer {client_token}
```

**Query Parameters** :
- `status` : `ACTIVE` | `USED` | `EXPIRED` (optionnel)
- `page` : Numéro de page
- `limit` : Items par page

**Réponse** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "code-uuid-1",
        "code": "PSN1-XXXX-YYYY-ZZZZ",
        "amount": 14500,
        "currency": "XOF",
        "status": "ACTIVE",
        "activationDate": "2025-10-04T14:30:00Z",
        "expiryDate": "2026-10-04T14:30:00Z",
        "giftCard": {
          "title": "PlayStation Network 20€",
          "brand": "PlayStation",
          "imageUrl": "https://...",
          "usageInstructions": "Connectez-vous à votre compte PSN..."
        }
      },
      {
        "id": "code-uuid-2",
        "code": "PSN2-AAAA-BBBB-CCCC",
        "amount": 14500,
        "status": "ACTIVE",
        "activationDate": "2025-10-04T14:30:00Z",
        "expiryDate": "2026-10-04T14:30:00Z",
        "giftCard": {
          "title": "PlayStation Network 20€",
          "brand": "PlayStation"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Étape 5.2 : Voir codes d'une commande spécifique

**Route** :
```http
GET /api/orders/{orderId}
Authorization: Bearer {client_token}
```

**Réponse** (extrait) :
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid-abc",
      "orderNumber": "YC1234567890",
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED",
      "items": [
        {
          "id": "item-uuid-1",
          "productType": "GIFT_CARD",
          "productName": "PlayStation Network 20€",
          "quantity": 2,
          "giftCardCodes": [
            {
              "id": "code-uuid-1",
              "code": "PSN1-XXXX-YYYY-ZZZZ",
              "status": "ACTIVE",
              "activationDate": "2025-10-04T14:30:00Z",
              "expiryDate": "2026-10-04T14:30:00Z"
            },
            {
              "id": "code-uuid-2",
              "code": "PSN2-AAAA-BBBB-CCCC",
              "status": "ACTIVE"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 🔍 PARTIE 6 : Monitoring & Gestion Admin

### Opération 6.1 : Supprimer un code de l'inventory

**Condition** : Code doit être `status: AVAILABLE` uniquement

**Route** :
```http
DELETE /api/admin/gift-cards/inventory/codes/{codeId}
Authorization: Bearer {admin_token}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Code deleted successfully"
}
```

**Erreur si code déjà assigné** :
```json
{
  "success": false,
  "code": "INVALID_STATUS",
  "message": "Cannot delete code with status ASSIGNED"
}
```

---

## 📊 PARTIE 7 : Modèles de Données Détaillés

### GiftCard
```typescript
{
  id: string,
  title: string,
  brand: string,
  slug: string,
  categoryId?: string,
  description?: string,
  termsConditions?: string,
  usageInstructions?: string,
  imageUrl: string,
  minAmount?: Decimal,
  maxAmount?: Decimal,
  fixedAmounts?: number[],
  discountPercentage: Decimal,
  isActive: boolean,
  validityDays: number,
  region?: string,

  // Relations
  inventory: GiftCardInventory[],
  orderItems: OrderItem[],
  giftCardCodes: GiftCardCode[]
}
```

### GiftCardInventory (Stock)
```typescript
{
  id: string,
  giftCardId: string,
  code: string,                        // Code réel du fournisseur
  status: "AVAILABLE" | "RESERVED" | "ASSIGNED" | "USED" | "EXPIRED" | "CANCELLED",
  orderItemId?: string,                // Lié si ASSIGNED
  reservedAt?: DateTime,
  assignedAt?: DateTime,
  assignedBy?: string,                 // Admin ID
  notes?: string,                      // "Manually entered" ou autre
  createdAt: DateTime,
  updatedAt: DateTime,

  // Relations
  giftCard: GiftCard,
  orderItem?: OrderItem,
  admin?: User
}
```

### GiftCardCode (Client)
```typescript
{
  id: string,
  code: string,                        // Copie du code inventory
  orderItemId?: string,
  giftCardId: string,
  userId?: string,
  inventoryCodeId?: string,            // Lien vers inventory
  amount: Decimal,
  currency: string,
  status: "PENDING" | "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED",
  activationDate?: DateTime,
  expiryDate?: DateTime,
  usedDate?: DateTime,
  usedByUserId?: string,
  createdAt: DateTime,
  updatedAt: DateTime,

  // Relations
  orderItem?: OrderItem,
  giftCard: GiftCard,
  user?: User,
  usedByUser?: User
}
```

### Order
```typescript
{
  id: string,
  orderNumber: string,
  userId: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED",
  paymentMethod: "WAVE",
  subtotal: Decimal,
  shippingCost: Decimal,
  taxAmount: Decimal,
  discountAmount: Decimal,
  totalAmount: Decimal,

  // Relations
  items: OrderItem[],
  wavePayments: WavePayment[]
}
```

### OrderItem
```typescript
{
  id: string,
  orderId: string,
  productType: "GIFT_CARD" | "PHYSICAL_PRODUCT",
  giftCardId?: string,
  physicalProductId?: string,
  productName: string,
  productBrand?: string,
  quantity: number,
  unitPrice: Decimal,
  giftCardAmount?: Decimal,            // Montant réel de la carte
  discountAmount: Decimal,
  totalPrice: Decimal,

  // Relations
  order: Order,
  giftCard?: GiftCard,
  giftCardCodes: GiftCardCode[],
  inventoryCodes: GiftCardInventory[]
}
```

---

## 🔄 PARTIE 8 : Workflows Détaillés

### Workflow A : Attribution Automatique (Optimal)

```
1. Admin importe 100 codes PSN via CSV
   ↓
2. Codes stockés dans GiftCardInventory (status: AVAILABLE)
   ↓
3. Client commande 2× PSN 20€ → Paie
   ↓
4. Job détecte paiement → Order.paymentStatus = COMPLETED
   ↓
5. Admin reçoit notification "Codes à attribuer"
   ↓
6. Admin clique "Attribuer codes" (1 clic)
   ↓
7. Système prend automatiquement 2 codes AVAILABLE
   ↓
8. Codes marqués ASSIGNED + GiftCardCode créés
   ↓
9. Client reçoit notification avec ses 2 codes
   ↓
10. Client voit codes dans l'app
```

**Temps total** : ~1 minute (dont 30s attente job)

---

### Workflow B : Saisie Manuelle (Flexible)

```
1. Client commande 2× PSN 20€ → Paie
   ↓
2. Job détecte paiement → Order.paymentStatus = COMPLETED
   ↓
3. Admin reçoit notification "Codes à attribuer"
   ↓
4. Admin ouvre interface de saisie manuelle
   ↓
5. Admin saisit code 1: "PSN1-XXXX"
   ↓
6. Système vérifie → Pas dans DB → Crée dans inventory + assigne
   ↓
7. Réponse: "1/2 codes assignés"
   ↓
8. Admin saisit code 2: "PSN2-YYYY"
   ↓
9. Système vérifie → Pas dans DB → Crée + assigne
   ↓
10. Réponse: "2/2 codes assignés"
    ↓
11. Notification client envoyée automatiquement
    ↓
12. Client voit codes dans l'app
```

**Temps total** : ~2-5 minutes (dépend vitesse saisie admin)

---

### Workflow C : Hybride (Mixte)

```
1. Client commande:
   - 2× PSN 20€ (codes dans inventory)
   - 1× iTunes 50€ (PAS dans inventory)
   ↓
2. Admin attribue auto PSN (Option A)
   → 2 codes PSN assignés
   ↓
3. Admin saisit manuellement iTunes (Option B)
   → 1 code iTunes assigné
   ↓
4. TOUS les codes assignés → Client notifié
```

---

## 🚨 PARTIE 9 : Gestion d'Erreurs & Troubleshooting

### Erreur 1 : Stock insuffisant (Option A)

**Symptôme** :
```json
{
  "success": false,
  "message": "Some codes could not be assigned",
  "errors": [{
    "error": "Insufficient codes in inventory",
    "needed": 2,
    "available": 0
  }]
}
```

**Solutions** :
1. Importer plus de codes via CSV
2. Utiliser Option B (saisie manuelle)
3. Demander au client de patienter

---

### Erreur 2 : Code déjà assigné (Option B)

**Symptôme** :
```json
{
  "success": false,
  "code": "CODE_ALREADY_ASSIGNED",
  "message": "Code already assigned to a customer"
}
```

**Solution** : Utiliser un code différent

---

### Erreur 3 : Paiement pas complété

**Symptôme** :
```json
{
  "success": false,
  "code": "PAYMENT_NOT_COMPLETED",
  "message": "Order payment is not completed"
}
```

**Solution** : Attendre que le job confirme le paiement (~30 secondes max)

---

### Erreur 4 : Tous les codes déjà assignés

**Symptôme** :
```json
{
  "success": false,
  "code": "ALL_CODES_ASSIGNED",
  "message": "All codes already assigned for this item"
}
```

**Solution** : Vérifier avec `GET /orders/{orderId}/codes` que c'est bien le cas

---

## ✅ Checklist Admin Quotidienne

### Matin
- [ ] Vérifier notifications "Codes à attribuer"
- [ ] Consulter `GET /api/admin/orders?paymentStatus=COMPLETED`
- [ ] Vérifier stock : `GET /api/admin/gift-cards/inventory/summary`
- [ ] Si alertes stock faible → Importer nouveaux codes

### Pour chaque commande
- [ ] Option A : `POST /orders/{orderId}/assign-codes` (si stock OK)
- [ ] Option B : Saisir codes 1 par 1 via `POST /order-items/{id}/assign-code`
- [ ] Vérifier notification client envoyée (logs)

### Soir
- [ ] Vérifier que toutes les commandes payées ont leurs codes
- [ ] Consulter audit logs : `GET /api/admin/audit-logs?action=gift_card_code`

---

## 📝 Notes Importantes

### Sécurité
- 🔒 Seuls les admins peuvent importer/attribuer des codes
- 🔒 Codes validés contre doublons automatiquement
- 🔒 Impossible d'attribuer un code déjà utilisé
- 🔒 Audit logs pour toutes les opérations

### Performance
- ⚡ Import CSV : jusqu'à 10MB (milliers de codes)
- ⚡ Attribution auto : ~1 seconde pour 10 items
- ⚡ Saisie manuelle : ~10-30 secondes par code

### Traçabilité
- 📊 Chaque code sait qui l'a assigné (`assignedBy`)
- 📊 Timestamp d'attribution (`assignedAt`)
- 📊 Notes pour codes manuels ("Manually entered")
- 📊 Audit logs complets

---

## 🚀 Améliorations Futures

1. **Attribution automatique au paiement** : Si stock disponible, assigner immédiatement
2. **Webhook Wave** : Notification immédiate au lieu de polling 30s
3. **API fournisseurs** : Intégration directe PSN, iTunes pour génération automatique
4. **Dashboard temps réel** : WebSocket pour alertes stock
5. **Expiration automatique** : Job pour marquer codes expirés
6. **Multi-devises** : Support codes internationaux
7. **Codes QR** : Génération automatique pour scan mobile

---

## 📚 Ressources

- **Documentation complète saisie manuelle** : [MANUAL_CODE_ASSIGNMENT.md](MANUAL_CODE_ASSIGNMENT.md)
- **API Docs** : http://localhost:30010/api-docs
- **Logs** : `pm2 logs yu-card-api`
- **Database** : `npx prisma studio`

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs yu-card-api --lines 100`
2. Consulter audit logs : `GET /api/admin/audit-logs`
3. Vérifier status job : `pm2 status yu-card-jobs`
4. Consulter cette documentation

**Toutes les routes sont protégées par authentification JWT et rôle ADMIN** ✅
