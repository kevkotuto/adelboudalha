# Yu Card Backend - Documentation des Routes Admin

## 📋 Table des matières

- [Authentification](#authentification)
- [Dashboard & Statistiques](#dashboard--statistiques)
- [Gestion des Utilisateurs](#gestion-des-utilisateurs)
- [Gestion des Commandes](#gestion-des-commandes)
- [Gestion des Produits Physiques](#gestion-des-produits-physiques)
- [Gestion des Gift Cards](#gestion-des-gift-cards)
- [Gestion des Catégories](#gestion-des-catégories)
- [Gestion du Wallet](#gestion-du-wallet)
- [Rapports Financiers](#rapports-financiers)
- [Notifications Push](#notifications-push)
- [Export de Données](#export-de-données)
- [Audit Logs](#audit-logs)
- [Activité Utilisateur](#activité-utilisateur)

---

## 🔐 Authentification

**Credentials Admin:**
```
Phone: +2250709176838
Password: Ce123456
```

**1. Login Admin**
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+2250709176838",
  "password": "Ce123456"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "phone": "+2250709176838",
      "fullName": "Administrateur Principal",
      "role": "ADMIN",
      "phoneVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

**Note:** Utilisez le `accessToken` dans l'en-tête `Authorization: Bearer {token}` pour toutes les requêtes admin.

---

## 📊 Dashboard & Statistiques

### GET /api/admin/dashboard

Récupère les statistiques complètes du dashboard admin.

**Requête:**
```http
GET /api/admin/dashboard?period=month&startDate=2025-09-01&endDate=2025-10-03
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `day`, `week`, `month`, `year` (défaut: `month`)
- `startDate` (optional): Date de début au format ISO
- `endDate` (optional): Date de fin au format ISO
- `timezone` (optional): Timezone (défaut: `UTC`)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalOrders": 320,
      "totalRevenue": 15000000,
      "totalProducts": 45,
      "totalGiftCards": 80,
      "averageOrderValue": 46875
    },
    "recentActivity": {
      "recentUsers": [...],
      "pendingOrders": [...],
      "lowStockProducts": [...]
    },
    "analytics": {
      "paymentStats": [...],
      "ordersByStatus": [...],
      "revenueByPeriod": [...],
      "userGrowth": [...],
      "orderGrowth": [...]
    },
    "topPerformers": {
      "products": [...],
      "giftCards": [...]
    }
  },
  "cached": false
}
```

**Features:**
- ✅ Cache de 5 minutes
- ✅ Statistiques en temps réel
- ✅ Produits en rupture de stock
- ✅ Commandes en attente
- ✅ Nouveaux utilisateurs (dernières 24h)
- ✅ Top produits et gift cards

---

## 👥 Gestion des Utilisateurs

### GET /api/admin/users

Liste tous les utilisateurs avec filtres et pagination.

**Requête:**
```http
GET /api/admin/users?page=1&limit=20&search=john&role=CLIENT&status=ACTIVE&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Numéro de page (défaut: 1)
- `limit` (optional): Nombre d'éléments par page (défaut: 20)
- `search` (optional): Recherche par nom, email ou téléphone
- `role` (optional): Filtre par rôle (`ALL`, `CLIENT`, `ADMIN`)
- `status` (optional): Filtre par statut (`ALL`, `ACTIVE`, `SUSPENDED`, `DELETED`)
- `sortBy` (optional): Champ de tri (défaut: `createdAt`)
- `sortOrder` (optional): Ordre de tri (`asc`, `desc`) (défaut: `desc`)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "...",
        "fullName": "John Doe",
        "phone": "+2250700000001",
        "email": "john@example.com",
        "role": "CLIENT",
        "status": "ACTIVE",
        "phoneVerified": true,
        "createdAt": "2025-09-15T10:30:00Z",
        "lastLoginAt": "2025-10-02T15:20:00Z",
        "_count": {
          "orders": 5,
          "reviews": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### PATCH /api/admin/users/:userId/status

Active ou suspend un utilisateur.

**Requête:**
```http
PATCH /api/admin/users/89c84246-6365-4de8-af6d-00890b2be59b/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false,
  "reason": "Violation des conditions d'utilisation"
}
```

**Body:**
- `isActive` (required): `true` pour activer, `false` pour suspendre
- `reason` (optional): Raison de la suspension (requis si `isActive` = false)

**Réponse:**
```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

**Protections:**
- ❌ Impossible de modifier un compte ADMIN
- ✅ Log automatique de l'action admin

### GET /api/admin/users/:userId/activity

Récupère l'activité détaillée d'un utilisateur.

**Requête:**
```http
GET /api/admin/users/89c84246-6365-4de8-af6d-00890b2be59b/activity
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "phone": "+2250700000001",
      "email": "john@example.com",
      "role": "CLIENT",
      "status": "ACTIVE",
      "preferences": {...},
      "addresses": [...]
    },
    "recentOrders": [...],
    "recentReviews": [...],
    "wallet": {
      "balance": 50000,
      "transactions": [...]
    },
    "recentNotifications": [...]
  }
}
```

**Informations incluses:**
- ✅ Profil utilisateur complet
- ✅ 10 dernières commandes
- ✅ 10 derniers avis
- ✅ Wallet et 10 dernières transactions
- ✅ 10 dernières notifications

---

## 📦 Gestion des Commandes

### GET /api/admin/orders

Liste toutes les commandes avec filtres et pagination.

**Requête:**
```http
GET /api/admin/orders?page=1&limit=20&search=ORD-&status=PENDING&paymentStatus=COMPLETED&startDate=2025-09-01&endDate=2025-10-03
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Numéro de page (défaut: 1)
- `limit` (optional): Nombre d'éléments par page (défaut: 20)
- `search` (optional): Recherche par ID de commande ou informations utilisateur
- `status` (optional): Filtre par statut (`ALL`, `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`)
- `paymentStatus` (optional): Filtre par statut de paiement (`ALL`, `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`)
- `startDate` (optional): Date de début
- `endDate` (optional): Date de fin
- `sortBy` (optional): Champ de tri (défaut: `createdAt`)
- `sortOrder` (optional): Ordre de tri (défaut: `desc`)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "...",
        "orderNumber": "ORD-20251003-001",
        "user": {
          "id": "...",
          "fullName": "John Doe",
          "phone": "+2250700000001"
        },
        "items": [...],
        "totalAmount": 150000,
        "status": "PENDING",
        "paymentStatus": "COMPLETED",
        "wavePayments": [...],
        "shippingAddress": {...},
        "createdAt": "2025-10-03T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 320,
      "totalPages": 16
    }
  }
}
```

### PATCH /api/admin/orders/:orderId/status

Modifie le statut d'une commande.

**Requête:**
```http
PATCH /api/admin/orders/89c84246-6365-4de8-af6d-00890b2be59b/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "SHIPPED",
  "notes": "Numéro de suivi: TRK123456789"
}
```

**Body:**
- `status` (required): `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `notes` (optional): Notes admin sur le changement de statut

**Réponse:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "...",
    "status": "SHIPPED",
    "shippedAt": "2025-10-03T14:30:00Z"
  }
}
```

**Features:**
- ✅ Met à jour automatiquement `confirmedAt`, `shippedAt`, `deliveredAt`, `cancelledAt`
- ✅ Envoi automatique de notifications SMS, Push et In-App
- ✅ Log automatique de l'action admin

---

## 🛍️ Gestion des Produits Physiques

### GET /api/admin/products

Liste tous les produits physiques.

**Requête:**
```http
GET /api/admin/products?page=1&limit=20&search=iphone&categoryId=...&isActive=true&sortBy=price&sortOrder=asc
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `sortOrder` (comme les autres routes)
- `categoryId` (optional): Filtre par catégorie
- `isActive` (optional): `true` ou `false`

**Réponse:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "...",
        "name": "iPhone 15 Pro Max 256GB",
        "brand": "Apple",
        "slug": "iphone-15-pro-max-256gb",
        "category": {
          "id": "...",
          "name": "Smartphones",
          "slug": "smartphones"
        },
        "price": 850000,
        "originalPrice": 1000000,
        "discountPercentage": 15,
        "stockQuantity": 25,
        "sku": "APL-IP15PM-256",
        "images": [...],
        "isPopular": true,
        "isFeatured": true,
        "isActive": true,
        "_count": {
          "reviews": 45,
          "favorites": 120
        }
      }
    ],
    "pagination": {...}
  }
}
```

### POST /api/admin/products

Crée un nouveau produit physique.

**Requête:**
```http
POST /api/admin/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "iPhone 15 Pro Max 256GB",
  "brand": "Apple",
  "categoryId": "...",
  "description": "Dernier iPhone avec puce A17 Pro",
  "price": 850000,
  "originalPrice": 1000000,
  "stockQuantity": 25,
  "sku": "APL-IP15PM-256",
  "weightKg": 0.221,
  "dimensionsCm": {
    "length": 16.0,
    "width": 7.7,
    "height": 0.8
  },
  "specifications": {
    "screen": "6.7 pouces OLED",
    "camera": "48MP + 12MP + 12MP",
    "battery": "4441 mAh",
    "processor": "A17 Pro"
  },
  "images": [
    "https://cdn.yucard.ci/products/iphone-15-pro-max-1.jpg",
    "https://cdn.yucard.ci/products/iphone-15-pro-max-2.jpg"
  ],
  "isPopular": true,
  "isFeatured": true,
  "deliveryTimeDays": 2,
  "warrantyMonths": 12,
  "metaKeywords": ["iphone", "apple", "smartphone", "5g"]
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "...",
    "name": "iPhone 15 Pro Max 256GB",
    "slug": "iphone-15-pro-max-256gb",
    "discountPercentage": 15,
    ...
  }
}
```

**Features:**
- ✅ Génération automatique du slug
- ✅ Calcul automatique du pourcentage de réduction
- ✅ Validation des données

### PATCH /api/admin/products/:productId

Met à jour un produit physique.

**Requête:**
```http
PATCH /api/admin/products/89c84246-6365-4de8-af6d-00890b2be59b
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 800000,
  "stockQuantity": 30,
  "isActive": true
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {...}
}
```

**Features:**
- ✅ Recalcul automatique du discount si les prix changent

### DELETE /api/admin/products/:productId

Supprime un produit physique.

**Requête:**
```http
DELETE /api/admin/products/89c84246-6365-4de8-af6d-00890b2be59b
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🎁 Gestion des Gift Cards

### GET /api/admin/gift-cards

Liste toutes les gift cards.

**Requête:**
```http
GET /api/admin/gift-cards?page=1&limit=20&search=netflix&categoryId=...&isActive=true
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "giftCards": [
      {
        "id": "...",
        "title": "Netflix Gift Card",
        "brand": "Netflix",
        "slug": "netflix-gift-card",
        "category": {...},
        "minAmount": 5000,
        "maxAmount": 100000,
        "fixedAmounts": [5000, 10000, 25000, 50000],
        "discountPercentage": 5,
        "stockQuantity": -1,
        "validityDays": 365,
        "isPopular": true,
        "isFeatured": true,
        "_count": {
          "reviews": 230,
          "favorites": 450,
          "giftCardCodes": 1250
        }
      }
    ],
    "pagination": {...}
  }
}
```

### POST /api/admin/gift-cards

Crée une nouvelle gift card.

**Requête:**
```http
POST /api/admin/gift-cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Netflix Gift Card",
  "brand": "Netflix",
  "categoryId": "...",
  "description": "Carte cadeau Netflix valable 12 mois",
  "termsConditions": "Valable uniquement en Côte d'Ivoire...",
  "usageInstructions": "1. Allez sur netflix.com/redeem\n2. Entrez le code...",
  "imageUrl": "https://cdn.yucard.ci/giftcards/netflix.jpg",
  "minAmount": 5000,
  "maxAmount": 100000,
  "fixedAmounts": [5000, 10000, 25000, 50000],
  "discountPercentage": 5,
  "isPopular": true,
  "isFeatured": true,
  "stockQuantity": -1,
  "validityDays": 365,
  "metaKeywords": ["netflix", "streaming", "series", "films"]
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Gift card created successfully",
  "data": {...}
}
```

**Features:**
- ✅ Génération automatique du slug
- ✅ `stockQuantity = -1` pour stock illimité

### PATCH /api/admin/gift-cards/:giftCardId

Met à jour une gift card.

**Requête:**
```http
PATCH /api/admin/gift-cards/89c84246-6365-4de8-af6d-00890b2be59b
Authorization: Bearer {token}
Content-Type: application/json

{
  "discountPercentage": 10,
  "isPopular": true
}
```

### DELETE /api/admin/gift-cards/:giftCardId

Supprime une gift card.

**Requête:**
```http
DELETE /api/admin/gift-cards/89c84246-6365-4de8-af6d-00890b2be59b
Authorization: Bearer {token}
```

---

## 📂 Gestion des Catégories

### GET /api/admin/categories

Liste toutes les catégories avec leur hiérarchie.

**Requête:**
```http
GET /api/admin/categories
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Électronique",
      "slug": "electronique",
      "type": "PHYSICAL_PRODUCT",
      "description": "Tous les produits électroniques",
      "iconUrl": "https://cdn.yucard.ci/icons/electronics.svg",
      "parentId": null,
      "displayOrder": 1,
      "isActive": true,
      "parent": null,
      "children": [
        {
          "id": "...",
          "name": "Smartphones",
          "slug": "smartphones",
          "isActive": true
        }
      ],
      "_count": {
        "giftCards": 0,
        "physicalProducts": 45
      }
    }
  ]
}
```

### POST /api/admin/categories

Crée une nouvelle catégorie.

**Requête:**
```http
POST /api/admin/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Smartphones",
  "type": "PHYSICAL_PRODUCT",
  "description": "Téléphones mobiles intelligents",
  "iconUrl": "https://cdn.yucard.ci/icons/smartphone.svg",
  "parentId": "...",
  "displayOrder": 1
}
```

**Body:**
- `name` (required): Nom de la catégorie
- `type` (required): `GIFT_CARD`, `PHYSICAL_PRODUCT`, `BOTH`
- `description` (optional): Description
- `iconUrl` (optional): URL de l'icône
- `parentId` (optional): ID de la catégorie parente (pour sous-catégorie)
- `displayOrder` (optional): Ordre d'affichage (défaut: 0)

**Réponse:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "...",
    "name": "Smartphones",
    "slug": "smartphones",
    ...
  }
}
```

**Features:**
- ✅ Génération automatique du slug
- ✅ Support des catégories hiérarchiques (parent/enfant)

### PATCH /api/admin/categories/:categoryId

Met à jour une catégorie.

### DELETE /api/admin/categories/:categoryId

Supprime une catégorie.

---

## 💰 Gestion du Wallet

### POST /api/admin/wallet/adjust

Ajuste le solde du wallet d'un utilisateur.

**Requête:**
```http
POST /api/admin/wallet/adjust
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "89c84246-6365-4de8-af6d-00890b2be59b",
  "amount": 50000,
  "type": "ADMIN_CREDIT",
  "description": "Bonus de bienvenue admin"
}
```

**Body:**
- `userId` (required): ID de l'utilisateur
- `amount` (required): Montant (positif)
- `type` (required): `ADMIN_CREDIT` (ajouter) ou `ADMIN_DEBIT` (retirer)
- `description` (required): Description de la transaction

**Réponse:**
```json
{
  "success": true,
  "message": "Wallet adjusted successfully",
  "data": {
    "wallet": {
      "id": "...",
      "balance": 50000,
      "totalEarned": 50000,
      "totalSpent": 0
    },
    "transaction": {
      "id": "...",
      "type": "ADMIN_CREDIT",
      "amount": 50000,
      "balanceBefore": 0,
      "balanceAfter": 50000,
      "description": "Bonus de bienvenue admin",
      "adminUserId": "..."
    }
  }
}
```

**Features:**
- ✅ Création automatique du wallet si inexistant
- ✅ Vérification du solde suffisant pour les débits
- ✅ Transaction atomique (wallet + log de transaction)
- ✅ Log de l'admin ayant effectué l'action

---

## 📈 Rapports Financiers

### GET /api/admin/reports/financial

Génère un rapport financier complet.

**Requête:**
```http
GET /api/admin/reports/financial?period=month&startDate=2025-09-01&endDate=2025-10-03
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `day`, `week`, `month`, `year`
- `startDate` (optional): Date de début
- `endDate` (optional): Date de fin

**Réponse:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 15000000,
      "totalOrders": 320,
      "averageOrderValue": 46875,
      "totalRefunds": 150000,
      "refundCount": 5,
      "totalTax": 0
    },
    "trends": {
      "dailyRevenue": [
        {
          "date": "2025-10-01",
          "revenue": 500000,
          "orders": 12
        }
      ],
      "averageOrderValue": [...]
    },
    "breakdown": {
      "ordersByStatus": [...],
      "revenueByCategory": [...],
      "revenueByPaymentMethod": [...]
    }
  }
}
```

**Informations incluses:**
- ✅ Chiffre d'affaires total
- ✅ Nombre de commandes
- ✅ Panier moyen
- ✅ Remboursements
- ✅ Tendances de revenus quotidiens
- ✅ Répartition par catégorie
- ✅ Répartition par méthode de paiement

---

## 🔔 Notifications Push

### POST /api/admin/notifications/send

Envoie des notifications push manuelles à des utilisateurs.

**Requête:**
```http
POST /api/admin/notifications/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nouvelle promotion !",
  "message": "Profitez de 20% de réduction sur toutes les cartes cadeaux",
  "userIds": ["user-id-1", "user-id-2"],
  "data": {
    "type": "promotion",
    "promotionId": "..."
  }
}
```

**Body:**
- `title` (required): Titre de la notification (max 100 caractères)
- `message` (required): Message de la notification (max 500 caractères)
- `userIds` (optional): Liste des IDs utilisateurs (vide = tous les utilisateurs avec push token)
- `data` (optional): Données additionnelles à inclure

**Réponse:**
```json
{
  "success": true,
  "message": "Notifications sent to 150 users",
  "data": {
    "sent": 145,
    "failed": 5,
    "total": 150
  }
}
```

**Features:**
- ✅ Envoi en masse via Expo Push Notifications
- ✅ Création automatique de notifications in-app
- ✅ Filtrage automatique des utilisateurs avec push token
- ✅ Statistiques d'envoi (succès/échecs)

### POST /api/admin/notifications/test/:userId

Envoie une notification de test à un utilisateur spécifique.

**Requête:**
```http
POST /api/admin/notifications/test/89c84246-6365-4de8-af6d-00890b2be59b
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe"
    },
    "ticketStatus": "ok"
  }
}
```

---

## 📥 Export de Données

### GET /api/admin/export/orders

Exporte les commandes au format CSV.

**Requête:**
```http
GET /api/admin/export/orders?startDate=2025-09-01&endDate=2025-10-03
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate` (optional): Date de début
- `endDate` (optional): Date de fin

**Réponse:**
Fichier CSV téléchargé avec:
- Order ID
- Order Number
- User Name
- User Phone
- Total Amount
- Status
- Payment Status
- Items Count
- Created At

### GET /api/admin/export/users

Exporte les utilisateurs au format CSV.

**Requête:**
```http
GET /api/admin/export/users
Authorization: Bearer {token}
```

**Réponse:**
Fichier CSV téléchargé avec:
- ID
- Full Name
- Phone
- Email
- Role
- Status
- Phone Verified
- Total Orders
- Created At
- Last Login

**Features:**
- ✅ Export complet de toutes les données
- ✅ Format CSV compatible Excel
- ✅ Nom de fichier horodaté

---

## 📜 Audit Logs

### GET /api/admin/audit-logs

Récupère les logs d'audit des actions admin.

**Requête:**
```http
GET /api/admin/audit-logs?page=1&limit=50&action=update&entityType=Order&userId=...
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Numéro de page (défaut: 1)
- `limit` (optional): Nombre d'éléments par page (défaut: 50)
- `action` (optional): Filtre par action (ex: `create`, `update`, `delete`)
- `entityType` (optional): Type d'entité (ex: `Order`, `Product`, `User`)
- `userId` (optional): Filtre par utilisateur

**Réponse:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "...",
        "userId": "...",
        "action": "UPDATE_ORDER_STATUS",
        "entityType": "Order",
        "entityId": "...",
        "oldValues": {"status": "PENDING"},
        "newValues": {"status": "SHIPPED"},
        "ipAddress": "82.180.149.184",
        "userAgent": "...",
        "createdAt": "2025-10-03T14:30:00Z",
        "user": {
          "fullName": "Administrateur Principal",
          "phone": "+2250709176838",
          "role": "ADMIN"
        }
      }
    ],
    "pagination": {...}
  }
}
```

**Features:**
- ✅ Traçabilité complète des actions admin
- ✅ Capture de l'ancien et du nouvel état
- ✅ IP et User-Agent enregistrés
- ✅ Filtrage avancé

---

## 🎯 Nouvelles Features Ajoutées

### ✨ Gestion Complète des Produits
- **CRUD complet** pour produits physiques
- Calcul automatique des réductions
- Génération automatique des slugs
- Gestion des stocks
- Support des spécifications techniques
- Images multiples
- Produits populaires et mis en avant

### ✨ Gestion Complète des Gift Cards
- **CRUD complet** pour gift cards
- Montants fixes ou plage de montants
- Stock illimité supporté (-1)
- Durée de validité configurable
- Termes et conditions
- Instructions d'utilisation

### ✨ Gestion des Catégories
- **CRUD complet** pour catégories
- Support des catégories hiérarchiques (parent/enfant)
- Types: GIFT_CARD, PHYSICAL_PRODUCT, BOTH
- Ordre d'affichage personnalisable
- Icônes personnalisables

### ✨ Gestion du Wallet Utilisateur
- Ajout/retrait de fonds par admin
- Création automatique du wallet
- Transactions atomiques
- Historique complet des transactions
- Log de l'admin ayant effectué l'action

### ✨ Notifications Push
- Envoi en masse de notifications
- Ciblage par utilisateurs spécifiques
- Notifications de test
- Statistiques d'envoi
- Double canal: Push + In-App

### ✨ Export de Données
- Export CSV des commandes
- Export CSV des utilisateurs
- Filtrage par date
- Fichiers horodatés

### ✨ Audit Logs
- Traçabilité complète des actions admin
- Capture des anciennes et nouvelles valeurs
- IP et User-Agent
- Filtrage avancé

### ✨ Activité Utilisateur Détaillée
- Profil complet de l'utilisateur
- Historique des commandes
- Historique des avis
- Wallet et transactions
- Notifications récentes

---

## 🔒 Sécurité

Toutes les routes admin sont protégées par:
- ✅ **Authentification JWT obligatoire**
- ✅ **Vérification du rôle ADMIN**
- ✅ **Logging de toutes les actions**
- ✅ **Validation des données (Zod)**
- ✅ **Protection contre les modifications de comptes admin**

---

## 🚀 Codes d'Erreur

| Code | Message | Description |
|------|---------|-------------|
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Pas les permissions admin |
| 404 | Not Found | Ressource non trouvée |
| 400 | Bad Request | Données invalides |
| 500 | Internal Server Error | Erreur serveur |

---

## 📝 Notes Importantes

1. **Toutes les routes nécessitent un token admin valide**
2. **Les modifications de comptes ADMIN sont interdites**
3. **Toutes les actions sont loggées**
4. **Les montants sont en francs CFA (XOF)**
5. **Les dates sont au format ISO 8601**
6. **Les IDs sont des UUIDs v4**

---

## 🎉 Résumé des Routes Admin

**Total: 28 routes admin**

### Dashboard & Rapports (2)
- GET /api/admin/dashboard
- GET /api/admin/reports/financial

### Utilisateurs (3)
- GET /api/admin/users
- PATCH /api/admin/users/:userId/status
- GET /api/admin/users/:userId/activity

### Commandes (2)
- GET /api/admin/orders
- PATCH /api/admin/orders/:orderId/status

### Produits Physiques (4)
- GET /api/admin/products
- POST /api/admin/products
- PATCH /api/admin/products/:productId
- DELETE /api/admin/products/:productId

### Gift Cards (4)
- GET /api/admin/gift-cards
- POST /api/admin/gift-cards
- PATCH /api/admin/gift-cards/:giftCardId
- DELETE /api/admin/gift-cards/:giftCardId

### Catégories (4)
- GET /api/admin/categories
- POST /api/admin/categories
- PATCH /api/admin/categories/:categoryId
- DELETE /api/admin/categories/:categoryId

### Wallet (1)
- POST /api/admin/wallet/adjust

### Notifications (2)
- POST /api/admin/notifications/send
- POST /api/admin/notifications/test/:userId

### Export (2)
- GET /api/admin/export/orders
- GET /api/admin/export/users

### Audit (1)
- GET /api/admin/audit-logs

### Autres Routes Existantes (3)
- Routes de recherche avancée
- Routes d'upload
- Routes de gestion des promotions

---

**Documentation générée le:** 2025-10-03
**Version API:** 1.0.0
**Base URL:** http://localhost:30010
**Production URL:** https://api.yucard.ci
