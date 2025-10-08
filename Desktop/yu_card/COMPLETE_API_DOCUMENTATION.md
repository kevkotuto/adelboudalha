# Documentation API Complète - Yu Card Backend

## 🏗️ Vue d'ensemble

Yu Card Backend est une API REST complète pour une plateforme de cartes cadeaux digitales et produits physiques en Côte d'Ivoire.

### 📍 URLs importantes

- **Production API** : `https://yucard.generale-ci.com/api`
- **Documentation Swagger** : `https://yucard.generale-ci.com/api-docs`
- **Health Check** : `https://yucard.generale-ci.com/health`

### 🔐 Authentification

La plupart des endpoints nécessitent une authentification JWT Bearer Token :

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### 📊 Rate Limiting

- **Général** : 100 requêtes / 15 minutes
- **Authentification** : 10 requêtes / 15 minutes
- **SMS/OTP** : 5 requêtes / 15 minutes

### 🌍 Localisation

- **Pays par défaut** : Côte d'Ivoire (CI)
- **Devise** : Franc CFA (XOF)
- **Fuseau horaire** : Africa/Abidjan
- **Langues supportées** : FR, EN, AR, ES, BM

---

## 📚 TABLE DES MATIÈRES

1. [Authentication](#-module-authentication) - Inscription, connexion, OTP
2. [Users](#-module-users) - Profil, préférences, adresses
3. [Categories](#-module-categories) - Catégories de produits
4. [Gift Cards](#-module-gift-cards) - **Cartes cadeaux digitales**
5. [Physical Products](#-module-physical-products) - Produits physiques
6. [Cart](#-module-cart) - Panier d'achat
7. [Orders](#-module-orders) - Commandes
8. [Promotions](#-module-promotions) - Codes promo
9. [Referrals](#-module-referrals) - Système de parrainage
10. [Wallets](#-module-wallets) - Portefeuille utilisateur
11. [Payments (Wave)](#-module-payments-wave) - Paiements Wave
12. [Reviews & Favorites](#-module-reviews--favorites) - Avis et favoris
13. [Notifications](#-module-notifications) - Notifications
14. [Search](#-module-search) - Recherche avancée
15. [Upload](#-module-upload) - Upload de fichiers
16. [Admin](#-module-admin) - Administration

---

## 🔐 MODULE AUTHENTICATION

### 1. Inscription d'un utilisateur

**POST** `/api/auth/register`

Crée un nouveau compte utilisateur avec vérification OTP.

#### Body (JSON)
```json
{
  "phone": "+225 01 23 45 67 89",
  "fullName": "Jean Dupont",
  "email": "jean@example.com",
  "password": "Password123",
  "language": "fr"
}
```

#### Champs
- `phone` (required) : Numéro de téléphone (+225XXXXXXXX)
- `fullName` (required) : Nom complet (2-100 caractères)
- `password` (required) : Mot de passe (min 8 caractères)
- `email` (optional) : Adresse email
- `language` (optional) : Langue (FR, EN, AR, ES, BM)

#### Réponse (201)
```json
{
  "success": true,
  "message": "Registration initiated. Please verify your phone number.",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "phone": "+225 01 23 45 67 89",
    "otpSent": true,
    "otpExpiresAt": "2025-01-01T12:05:00.000Z"
  }
}
```

---

### 2. Connexion utilisateur

**POST** `/api/auth/login`

#### Body (JSON)
```json
{
  "phone": "+225 01 23 45 67 89",
  "password": "Password123"
}
```

#### Réponse (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "phone": "+225 01 23 45 67 89",
      "fullName": "Jean Dupont",
      "email": "jean@example.com",
      "role": "CLIENT",
      "status": "ACTIVE",
      "phoneVerified": true,
      "hasCompletedOnboarding": true,
      "avatarUrl": null,
      "lastLoginAt": "2025-01-01T12:00:00.000Z",
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

---

### 3. Vérification OTP

**POST** `/api/auth/verify-otp`

#### Body (JSON)
```json
{
  "phone": "+225 01 23 45 67 89",
  "otp": "123456",
  "type": "registration"
}
```

#### Types d'OTP
- `REGISTRATION` : Vérification après inscription
- `LOGIN` : Vérification à la connexion
- `PASSWORD_RESET` : Réinitialisation de mot de passe
- `PHONE_VERIFICATION` : Changement de téléphone

---

### 4. Renvoyer OTP

**POST** `/api/auth/resend-otp`

---

### 5. Mot de passe oublié

**POST** `/api/auth/forgot-password`

---

### 6. Réinitialiser mot de passe

**POST** `/api/auth/reset-password`

---

### 7. Changer mot de passe

**POST** `/api/auth/change-password` 🔒

---

### 8. Renouveler token

**POST** `/api/auth/refresh`

---

### 9. Déconnexion

**POST** `/api/auth/logout` 🔒

---

### 10. Profil utilisateur

**GET** `/api/auth/profile` 🔒

---

## 👤 MODULE USERS

### 1. Mettre à jour le profil

**PUT** `/api/users/profile` 🔒

#### Body (JSON)
```json
{
  "fullName": "Jean Claude Dupont",
  "email": "jean.claude@example.com"
}
```

---

### 2. Upload avatar

**POST** `/api/users/avatar` 🔒

#### Body (Form Data)
- `avatar` : Fichier image (JPEG, PNG, max 2MB)

---

### 3. Récupérer les préférences

**GET** `/api/users/preferences` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "preferences": {
      "language": "FR",
      "notificationsEnabled": true,
      "newsletterEnabled": true,
      "smsNotifications": true,
      "emailNotifications": true,
      "pushNotifications": true,
      "theme": "LIGHT"
    }
  }
}
```

---

### 4. Mettre à jour les préférences

**PUT** `/api/users/preferences` 🔒

#### Thèmes disponibles
- `LIGHT` : Thème clair
- `DARK` : Thème sombre
- `SYSTEM` : Selon le système

---

### 5. Récupérer les adresses

**GET** `/api/users/addresses` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "addr-123",
        "fullName": "Jean Dupont",
        "phone": "+225 01 23 45 67 89",
        "addressLine1": "123 Rue de la Paix",
        "addressLine2": "Appartement 4B",
        "city": "Abidjan",
        "stateProvince": "Lagunes",
        "postalCode": "00225",
        "country": "CI",
        "isDefault": true,
        "type": "BOTH",
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 6. Créer une adresse

**POST** `/api/users/addresses` 🔒

#### Types d'adresse
- `SHIPPING` : Adresse de livraison
- `BILLING` : Adresse de facturation
- `BOTH` : Les deux

---

### 7. Mettre à jour une adresse

**PUT** `/api/users/addresses/{id}` 🔒

---

### 8. Supprimer une adresse

**DELETE** `/api/users/addresses/{id}` 🔒

---

### 9. Statistiques utilisateur

**GET** `/api/users/stats` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 15,
      "totalSpent": 250000,
      "totalSavings": 35000,
      "favoriteCategories": ["Gaming", "Mobile"],
      "giftCardsOwned": 8,
      "physicalProductsOrdered": 7,
      "referralCount": 3,
      "walletBalance": 15000,
      "memberSince": "2025-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 10. Supprimer le compte

**DELETE** `/api/users/account` 🔒

---

## 📂 MODULE CATEGORIES

### 1. Lister les catégories

**GET** `/api/categories`

#### Query Parameters
- `page` (integer, default: 1)
- `limit` (integer, default: 50)
- `type` (enum: GIFT_CARD, PHYSICAL_PRODUCT, BOTH)
- `parentId` (string UUID ou "null" pour racines)
- `includeInactive` (boolean, default: false, admin only)
- `includeChildren` (boolean, default: true)

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cat-123",
        "name": "Gaming",
        "slug": "gaming",
        "type": "GIFT_CARD",
        "description": "Cartes cadeaux gaming et jeux vidéo",
        "iconUrl": "https://files.yucard.ci/icons/gaming.png",
        "parentId": null,
        "displayOrder": 1,
        "isActive": true,
        "createdAt": "2025-01-01T12:00:00.000Z",
        "updatedAt": "2025-01-01T12:00:00.000Z",
        "children": [
          {
            "id": "cat-456",
            "name": "Steam",
            "slug": "steam",
            "type": "GIFT_CARD",
            "isActive": true,
            "displayOrder": 1,
            "_count": {
              "giftCards": 15,
              "physicalProducts": 0
            }
          }
        ],
        "_count": {
          "giftCards": 25,
          "physicalProducts": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 45,
      "totalPages": 1
    }
  }
}
```

---

### 2. Récupérer une catégorie par ID

**GET** `/api/categories/{id}`

---

### 3. Récupérer une catégorie par slug

**GET** `/api/categories/slug/{slug}`

---

### 4. Créer une catégorie (Admin)

**POST** `/api/categories` 🔒👨‍💼

#### Body (JSON)
```json
{
  "name": "Mobile",
  "type": "GIFT_CARD",
  "description": "Cartes de recharge mobile",
  "iconUrl": "https://files.yucard.ci/icons/mobile.png",
  "parentId": null,
  "displayOrder": 2,
  "isActive": true
}
```

---

### 5. Mettre à jour une catégorie (Admin)

**PUT** `/api/categories/{id}` 🔒👨‍💼

---

### 6. Supprimer une catégorie (Admin)

**DELETE** `/api/categories/{id}` 🔒👨‍💼

---

## 🎴 MODULE GIFT CARDS

### 1. Lister les cartes cadeaux

**GET** `/api/gift-cards`

#### Query Parameters
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `category` (string UUID)
- `brand` (string)
- `minAmount` (number)
- `maxAmount` (number)
- `region` (string, ex: "CI")
- `featured` (boolean)
- `popular` (boolean)
- `sort` (enum: title, brand, createdAt)
- `order` (enum: asc, desc)

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "gift-123",
        "title": "Carte Steam 10€",
        "brand": "Steam",
        "slug": "carte-steam-10",
        "categoryId": "cat-gaming",
        "description": "Carte cadeau Steam valable pour tous les jeux",
        "termsConditions": "Valable 365 jours",
        "usageInstructions": "Code à activer sur Steam",
        "imageUrl": "https://files.yucard.ci/gifts/steam-10.jpg",
        "backgroundImageUrl": "https://files.yucard.ci/gifts/steam-bg.jpg",
        "backgroundColor": "#1B2838",
        "gradientStart": "#1B2838",
        "gradientEnd": "#2A475E",
        "minAmount": 5000,
        "maxAmount": 50000,
        "fixedAmounts": [5000, 10000, 25000, 50000],
        "currency": "XOF",
        "discountPercentage": 5.0,
        "isPopular": true,
        "isFeatured": false,
        "isActive": true,
        "stockQuantity": -1,
        "validityDays": 365,
        "region": "CI",
        "displayOrder": 1,
        "metaKeywords": ["steam", "gaming", "jeux"],
        "createdAt": "2025-01-01T12:00:00.000Z",
        "updatedAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### 2. Cartes cadeaux en vedette

**GET** `/api/gift-cards/featured`

---

### 3. Cartes cadeaux populaires

**GET** `/api/gift-cards/popular`

---

### 4. Récupérer une carte cadeau

**GET** `/api/gift-cards/{id}`

Paramètre `id` peut être UUID ou slug

---

### 5. Créer une carte cadeau (Admin)

**POST** `/api/gift-cards` 🔒👨‍💼

#### Body (JSON)
```json
{
  "title": "PlayStation Store 25€",
  "brand": "PlayStation",
  "categoryId": "cat-gaming",
  "description": "Carte PlayStation Store",
  "imageUrl": "https://files.yucard.ci/gifts/psn-25.jpg",
  "fixedAmounts": [15000, 25000, 50000],
  "currency": "XOF",
  "discountPercentage": 3.5,
  "validityDays": 365,
  "region": "CI",
  "metaKeywords": ["playstation", "psn", "gaming"]
}
```

---

### 6. Mettre à jour une carte cadeau (Admin)

**PUT** `/api/gift-cards/{id}` 🔒👨‍💼

---

### 7. Supprimer une carte cadeau (Admin)

**DELETE** `/api/gift-cards/{id}` 🔒👨‍💼

---

### 8. Cartes cadeaux similaires

**GET** `/api/gift-cards/{id}/related`

---

## 🛍️ MODULE PHYSICAL PRODUCTS

### 1. Lister les produits

**GET** `/api/products`

#### Query Parameters
- `page`, `limit`, `category`, `brand`
- `minPrice`, `maxPrice`
- `inStock`, `featured`, `popular`
- `sort` (name, price, rating, createdAt)
- `order` (asc, desc)

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "prod-123",
        "name": "iPhone 15 Pro",
        "brand": "Apple",
        "slug": "iphone-15-pro",
        "categoryId": "cat-tech",
        "description": "Dernière génération iPhone avec puce A17 Pro",
        "price": 850000,
        "originalPrice": 900000,
        "currency": "XOF",
        "discountPercentage": 5.6,
        "stockQuantity": 25,
        "sku": "IPH15PRO128",
        "weightKg": 0.187,
        "dimensionsCm": {
          "length": 14.67,
          "width": 7.09,
          "height": 0.83
        },
        "specifications": {
          "storage": "128GB",
          "color": "Natural Titanium",
          "display": "6.1 inch Super Retina XDR"
        },
        "images": [
          "https://files.yucard.ci/products/iphone15pro_1.jpg",
          "https://files.yucard.ci/products/iphone15pro_2.jpg"
        ],
        "isPopular": true,
        "isFeatured": false,
        "isActive": true,
        "deliveryTimeDays": 3,
        "warrantyMonths": 12,
        "rating": 4.8,
        "reviewCount": 127,
        "displayOrder": 0,
        "metaKeywords": ["iPhone", "Apple", "smartphone"],
        "createdAt": "2025-01-01T12:00:00.000Z",
        "updatedAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

### 2. Produits mis en avant

**GET** `/api/products/featured`

---

### 3. Produits populaires

**GET** `/api/products/popular`

---

### 4. Créer un produit (Admin)

**POST** `/api/products` 🔒👨‍💼

---

### 5. Récupérer un produit

**GET** `/api/products/{id}`

---

### 6. Mettre à jour un produit (Admin)

**PUT** `/api/products/{id}` 🔒👨‍💼

---

### 7. Supprimer un produit (Admin)

**DELETE** `/api/products/{id}` 🔒👨‍💼

---

### 8. Upload images produit (Admin)

**POST** `/api/products/{id}/images` 🔒👨‍💼

#### Body (Form Data)
- `images` : Fichiers images (max 5 fichiers, 5MB chacun)

---

### 9. Produits similaires

**GET** `/api/products/{id}/related`

---

### 10. Mettre à jour stock (Admin)

**PATCH** `/api/products/{id}/stock` 🔒👨‍💼

#### Body (JSON)
```json
{
  "quantity": 50,
  "operation": "add"
}
```

#### Opérations
- `set` : Définir la quantité
- `add` : Ajouter à la quantité
- `subtract` : Soustraire de la quantité

---

## 🛒 MODULE CART

### 1. Récupérer le panier

**GET** `/api/cart` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-123",
        "userId": "user-123",
        "productType": "GIFT_CARD",
        "giftCardId": "gift-123",
        "physicalProductId": null,
        "quantity": 2,
        "giftCardAmount": 10000,
        "addedAt": "2025-01-01T12:00:00.000Z",
        "giftCard": {
          "id": "gift-123",
          "title": "Carte Steam 10€",
          "brand": "Steam",
          "imageUrl": "https://files.yucard.ci/gifts/steam-10.jpg"
        }
      }
    ],
    "summary": {
      "itemCount": 2,
      "subtotal": 20000,
      "totalSavings": 1000
    }
  }
}
```

---

### 2. Ajouter au panier

**POST** `/api/cart/items` 🔒

#### Body (JSON)
```json
{
  "productType": "GIFT_CARD",
  "giftCardId": "gift-123",
  "quantity": 1,
  "giftCardAmount": 10000
}
```

OU

```json
{
  "productType": "PHYSICAL_PRODUCT",
  "physicalProductId": "prod-123",
  "quantity": 1
}
```

---

### 3. Mettre à jour quantité

**PATCH** `/api/cart/items/{itemId}` 🔒

#### Body (JSON)
```json
{
  "quantity": 3
}
```

---

### 4. Supprimer du panier

**DELETE** `/api/cart/items/{itemId}` 🔒

---

### 5. Vider le panier

**DELETE** `/api/cart` 🔒

---

## 📦 MODULE ORDERS

### 1. Créer une commande

**POST** `/api/orders` 🔒

#### Body (JSON)
```json
{
  "shippingAddressId": "addr-123",
  "billingAddressId": "addr-123",
  "paymentMethod": "WAVE",
  "contactPhone": "+225 01 23 45 67 89",
  "notes": "Livraison le matin",
  "promotionCode": "WELCOME20"
}
```

#### Réponse (201)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order-123",
      "orderNumber": "YC20250101001",
      "userId": "user-123",
      "status": "PENDING",
      "subtotal": 50000,
      "shippingCost": 2000,
      "taxAmount": 0,
      "discountAmount": 10000,
      "totalAmount": 42000,
      "currency": "XOF",
      "paymentMethod": "WAVE",
      "paymentStatus": "PENDING",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 2. Récupérer mes commandes

**GET** `/api/orders` 🔒

#### Query Parameters
- `page`, `limit`
- `status` (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED)
- `paymentStatus` (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)

---

### 3. Récupérer une commande

**GET** `/api/orders/{id}` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "YC20250101001",
    "status": "CONFIRMED",
    "items": [
      {
        "id": "item-123",
        "productType": "GIFT_CARD",
        "productName": "Carte Steam 10€",
        "productBrand": "Steam",
        "productImage": "https://files.yucard.ci/gifts/steam-10.jpg",
        "quantity": 2,
        "unitPrice": 10000,
        "giftCardAmount": 10000,
        "discountAmount": 1000,
        "totalPrice": 19000,
        "giftCardCodes": [
          {
            "id": "code-123",
            "code": "XXXX-XXXX-XXXX",
            "status": "ACTIVE",
            "amount": 10000,
            "expiryDate": "2026-01-01T12:00:00.000Z"
          }
        ]
      }
    ],
    "shippingAddress": {
      "fullName": "Jean Dupont",
      "phone": "+225 01 23 45 67 89",
      "addressLine1": "123 Rue de la Paix",
      "city": "Abidjan",
      "country": "CI"
    },
    "totalAmount": 42000,
    "createdAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

### 4. Annuler une commande

**POST** `/api/orders/{id}/cancel` 🔒

#### Body (JSON)
```json
{
  "reason": "Changement d'avis"
}
```

---

### 5. Suivre une commande

**GET** `/api/orders/{id}/tracking` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "trackingNumber": "TRK123456789",
    "carrier": "DHL",
    "status": "IN_TRANSIT",
    "currentLocation": "Abidjan Hub",
    "estimatedDelivery": "2025-01-05",
    "events": [
      {
        "eventDate": "2025-01-01T10:00:00.000Z",
        "status": "SHIPPED",
        "description": "Colis expédié",
        "location": "Entrepôt Abidjan"
      }
    ]
  }
}
```

---

## 🎁 MODULE PROMOTIONS

### 1. Valider un code promo

**POST** `/api/promotions/validate` 🔒

#### Body (JSON)
```json
{
  "code": "WELCOME20",
  "orderAmount": 50000,
  "productIds": ["prod-123", "gift-456"]
}
```

#### Réponse (200)
```json
{
  "success": true,
  "message": "Promo code valid",
  "data": {
    "isValid": true,
    "discountAmount": 10000,
    "promotion": {
      "id": "promo-123",
      "name": "Promotion de bienvenue",
      "type": "PERCENTAGE",
      "value": 20
    }
  }
}
```

---

### 2. Appliquer un code promo

**POST** `/api/promotions/apply` 🔒

#### Body (JSON)
```json
{
  "code": "WELCOME20",
  "orderId": "order-123",
  "orderAmount": 50000,
  "productIds": ["prod-123"]
}
```

---

### 3. Promotions disponibles

**GET** `/api/promotions/available` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "promo-123",
      "code": "WELCOME20",
      "name": "Promotion de bienvenue",
      "description": "20% de réduction sur votre première commande",
      "type": "PERCENTAGE",
      "value": 20,
      "minPurchaseAmount": 30000,
      "maxDiscountAmount": 15000,
      "applicableTo": "ALL",
      "usageLimit": 1000,
      "usageCount": 250,
      "usagePerCustomer": 1,
      "validFrom": "2025-01-01T00:00:00.000Z",
      "validUntil": "2025-12-31T23:59:59.000Z",
      "isActive": true
    }
  ]
}
```

---

### 4. Historique des promotions

**GET** `/api/promotions/history` 🔒

---

### 5. Toutes les promotions (Admin)

**GET** `/api/promotions/admin` 🔒👨‍💼

#### Query Parameters
- `page`, `limit`
- `search` (recherche par code ou nom)
- `isActive` (boolean)
- `type` (PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING)
- `sortBy`, `sortOrder`

---

### 6. Créer une promotion (Admin)

**POST** `/api/promotions/admin` 🔒👨‍💼

#### Body (JSON)
```json
{
  "code": "SUMMER2025",
  "name": "Promotion d'été",
  "description": "Profitez de l'été avec nos réductions",
  "type": "PERCENTAGE",
  "value": 25,
  "minPurchaseAmount": 30000,
  "maxDiscountAmount": 15000,
  "applicableTo": "ALL",
  "usageLimit": 500,
  "usagePerCustomer": 1,
  "validFrom": "2025-06-01T00:00:00.000Z",
  "validUntil": "2025-08-31T23:59:59.000Z",
  "isActive": true
}
```

#### Types de promotion
- `PERCENTAGE` : Réduction en pourcentage
- `FIXED_AMOUNT` : Montant fixe
- `FREE_SHIPPING` : Livraison gratuite

#### Applicable à
- `ALL` : Tous les produits
- `GIFT_CARDS` : Cartes cadeaux uniquement
- `PHYSICAL_PRODUCTS` : Produits physiques uniquement
- `SPECIFIC_PRODUCTS` : Produits spécifiques (avec `productIds`)

---

### 7. Mettre à jour une promotion (Admin)

**PUT** `/api/promotions/admin/{id}` 🔒👨‍💼

---

### 8. Supprimer une promotion (Admin)

**DELETE** `/api/promotions/admin/{id}` 🔒👨‍💼

---

### 9. Dupliquer une promotion (Admin)

**POST** `/api/promotions/admin/{id}/duplicate` 🔒👨‍💼

---

### 10. Statistiques promotions (Admin)

**GET** `/api/promotions/admin/stats` 🔒👨‍💼

---

## 🤝 MODULE REFERRALS

### 1. Mon code de parrainage

**GET** `/api/referrals/my-code` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "code": "REF12ABC3456",
    "status": "ACTIVE",
    "bonusType": "FIXED_AMOUNT",
    "bonusValue": 5000,
    "minPurchaseAmount": 30000,
    "createdAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

### 2. Générer un lien de parrainage

**POST** `/api/referrals/generate-link` 🔒

#### Body (JSON)
```json
{
  "baseUrl": "https://yucard.ci"
}
```

#### Réponse (200)
```json
{
  "success": true,
  "message": "Referral link generated successfully",
  "data": {
    "code": "REF12ABC3456",
    "link": "https://yucard.ci/register?ref=REF12ABC3456",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://yucard.ci/register?ref=REF12ABC3456"
  }
}
```

---

### 3. Mes filleuls parrainés

**GET** `/api/referrals/my-referrals` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "ref-123",
        "referralCode": "REF12ABC3456",
        "status": "COMPLETED",
        "bonusValue": 5000,
        "appliedAt": "2025-01-02T12:00:00.000Z",
        "referred": {
          "id": "user-456",
          "fullName": "Julie Doe",
          "phone": "+225 01 XX XX XX 89"
        },
        "firstOrder": {
          "id": "order-789",
          "totalAmount": 50000
        },
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### 4. Mes récompenses de parrainage

**GET** `/api/referrals/my-rewards` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "reward-123",
        "referralId": "ref-123",
        "rewardType": "REFERRER_BONUS",
        "rewardValue": 5000,
        "status": "AVAILABLE",
        "description": "Bonus de parrainage pour Julie Doe",
        "createdAt": "2025-01-02T12:00:00.000Z",
        "expiresAt": "2025-07-02T12:00:00.000Z"
      }
    ],
    "summary": {
      "total": 10,
      "available": 3,
      "claimed": 5,
      "expired": 2,
      "totalValue": 40000,
      "claimedValue": 25000
    }
  }
}
```

---

### 5. Réclamer une récompense

**POST** `/api/referrals/claim-reward/{rewardId}` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "message": "Reward claimed successfully",
  "data": {
    "reward": {
      "id": "reward-123",
      "status": "CLAIMED",
      "claimedAt": "2025-01-03T12:00:00.000Z"
    },
    "claimedAmount": 5000
  }
}
```

---

### 6. Valider un code de parrainage

**GET** `/api/referrals/validate/{code}`

#### Réponse (200)
```json
{
  "success": true,
  "message": "Valid referral code",
  "data": {
    "code": "REF12ABC3456",
    "referrer": {
      "id": "user-123",
      "fullName": "Jean Dupont",
      "avatarUrl": null
    },
    "bonusInfo": {
      "type": "FIXED_AMOUNT",
      "value": 5000,
      "minPurchaseAmount": 30000
    }
  }
}
```

---

### 7. Mes statistiques de parrainage

**GET** `/api/referrals/my-stats` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "totalReferrals": 15,
    "completedReferrals": 8,
    "pendingReferrals": 7,
    "conversionRate": 53.33,
    "totalRewards": 10,
    "totalRewardValue": 40000
  }
}
```

---

### 8. Tous les parrainages (Admin)

**GET** `/api/referrals/admin` 🔒👨‍💼

---

### 9. Statistiques globales (Admin)

**GET** `/api/referrals/admin/stats` 🔒👨‍💼

---

### 10. Approuver un parrainage (Admin)

**POST** `/api/referrals/admin/{id}/approve` 🔒👨‍💼

---

### 11. Configurer les règles (Admin)

**POST** `/api/referrals/admin/configure` 🔒👨‍💼

---

### 12. Expirer les récompenses (Admin)

**POST** `/api/referrals/admin/expire-rewards` 🔒👨‍💼

---

## 💰 MODULE WALLETS

### 1. Solde du portefeuille

**GET** `/api/wallets/balance` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "balance": {
      "balance": 25000.50,
      "pendingBalance": 5000.00,
      "totalEarned": 100000.00,
      "totalSpent": 75000.00
    }
  }
}
```

---

### 2. Transactions du portefeuille

**GET** `/api/wallets/transactions` 🔒

#### Query Parameters
- `type` (CREDIT, DEBIT, REFUND, BONUS, CASHBACK, ADMIN_CREDIT, ADMIN_DEBIT, ORDER_PAYMENT, REFERRAL_REWARD)
- `startDate`, `endDate`
- `page`, `limit`

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn-123",
        "walletId": "wallet-123",
        "userId": "user-123",
        "type": "CREDIT",
        "amount": 5000,
        "balanceBefore": 20000,
        "balanceAfter": 25000,
        "description": "Bonus de parrainage",
        "reference": "REF-123",
        "orderId": null,
        "referralId": "ref-123",
        "promotionId": null,
        "metadata": {},
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

### 3. Utiliser le solde pour paiement

**POST** `/api/wallets/use-balance` 🔒

#### Body (JSON)
```json
{
  "amount": 15000,
  "orderId": "order-123",
  "description": "Paiement commande #YC20250101001"
}
```

---

### 4. Transférer des fonds

**POST** `/api/wallets/transfer` 🔒

#### Body (JSON)
```json
{
  "toUserId": "user-456",
  "amount": 5000,
  "description": "Remboursement"
}
```

---

### 5. Ajouter des fonds (Admin)

**POST** `/api/wallets/admin/add-funds` 🔒👨‍💼

#### Body (JSON)
```json
{
  "userId": "user-123",
  "amount": 10000,
  "description": "Compensation client"
}
```

---

### 6. Statistiques wallets (Admin)

**GET** `/api/wallets/admin/stats` 🔒👨‍💼

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalWallets": 1250,
      "totalBalance": 5000000,
      "totalEarned": 15000000,
      "totalSpent": 10000000,
      "activeWallets": 850
    }
  }
}
```

---

### 7. Wallet d'un utilisateur (Admin)

**GET** `/api/wallets/admin/user/{userId}` 🔒👨‍💼

---

## 💳 MODULE PAYMENTS WAVE

*Voir le fichier [WAVE_API_DOCUMENTATION.md](./WAVE_API_DOCUMENTATION.md) pour la documentation complète des 20+ endpoints de paiement Wave.*

### Endpoints principaux:
- **POST** `/api/payments/wave/initiate` 🔒 - Initier un paiement
- **POST** `/api/payments/wave/webhook` - Webhook Wave (callback)
- **GET** `/api/payments/wave/status/{transactionId}` 🔒 - Statut paiement
- **POST** `/api/payments/wave/refund/{paymentId}` 🔒👨‍💼 - Remboursement

---

## ⭐ MODULE REVIEWS & FAVORITES

### 1. Ajouter un avis

**POST** `/api/reviews` 🔒

#### Body (JSON)
```json
{
  "productType": "GIFT_CARD",
  "giftCardId": "gift-123",
  "orderItemId": "item-123",
  "rating": 5,
  "title": "Excellent produit",
  "comment": "Livraison rapide, code fonctionnel",
  "images": ["https://files.yucard.ci/reviews/img1.jpg"]
}
```

---

### 2. Avis d'un produit

**GET** `/api/products/{id}/reviews`

OU

**GET** `/api/gift-cards/{id}/reviews`

---

### 3. Ajouter aux favoris

**POST** `/api/favorites` 🔒

#### Body (JSON)
```json
{
  "productType": "GIFT_CARD",
  "giftCardId": "gift-123"
}
```

---

### 4. Mes favoris

**GET** `/api/favorites` 🔒

---

### 5. Retirer des favoris

**DELETE** `/api/favorites/{id}` 🔒

---

## 🔔 MODULE NOTIFICATIONS

### 1. Mes notifications

**GET** `/api/notifications` 🔒

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-123",
        "type": "ORDER",
        "title": "Commande confirmée",
        "message": "Votre commande #YC20250101001 a été confirmée",
        "data": {
          "orderId": "order-123"
        },
        "isRead": false,
        "channel": "IN_APP",
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

### 2. Marquer comme lu

**PATCH** `/api/notifications/{id}/read` 🔒

---

### 3. Marquer tout comme lu

**PATCH** `/api/notifications/read-all` 🔒

---

### 4. Supprimer une notification

**DELETE** `/api/notifications/{id}` 🔒

---

## 🔍 MODULE SEARCH

### 1. Recherche avancée

**GET** `/api/search/advanced`

#### Query Parameters
- `q` (query string)
- `type` (ALL, GIFT_CARDS, PHYSICAL_PRODUCTS)
- `category`
- `minPrice`, `maxPrice`
- `sort`, `order`

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "giftCards": [...],
    "physicalProducts": [...],
    "totalResults": 25
  }
}
```

---

## 📤 MODULE UPLOAD

### 1. Upload de fichier

**POST** `/api/upload` 🔒

#### Body (Form Data)
- `file` : Fichier (max 10MB)
- `type` : Type (avatar, product, review, etc.)

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "url": "https://files.yucard.ci/uploads/file-123.jpg",
    "filename": "file-123.jpg",
    "size": 156789,
    "mimeType": "image/jpeg"
  }
}
```

---

## ⚙️ MODULE ADMIN

### 1. Dashboard stats

**GET** `/api/admin/dashboard` 🔒👨‍💼

#### Réponse (200)
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalOrders": 3456,
    "totalRevenue": 125000000,
    "pendingOrders": 45,
    "lowStockProducts": 12
  }
}
```

---

### 2. Gestion utilisateurs

**GET** `/api/admin/users` 🔒👨‍💼

---

### 3. Suspendre un utilisateur

**POST** `/api/admin/users/{id}/suspend` 🔒👨‍💼

---

### 4. Logs d'audit

**GET** `/api/admin/audit-logs` 🔒👨‍💼

---

## 🔧 CONFIGURATION & CODES D'ERREUR

### Codes d'erreur HTTP

- **200** : Succès
- **201** : Créé avec succès
- **400** : Requête invalide
- **401** : Non authentifié
- **403** : Accès refusé
- **404** : Ressource introuvable
- **409** : Conflit (ressource existante)
- **422** : Validation échouée
- **423** : Compte verrouillé
- **429** : Trop de requêtes (rate limiting)
- **500** : Erreur serveur

### Codes d'erreur métier

#### Authentication
- `USER_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `ACCOUNT_LOCKED`
- `OTP_EXPIRED`
- `OTP_INVALID`
- `PHONE_NOT_VERIFIED`

#### Users
- `EMAIL_ALREADY_TAKEN`
- `ADDRESS_NOT_FOUND`
- `CANNOT_DELETE_DEFAULT_ADDRESS`

#### Categories
- `CATEGORY_NAME_EXISTS`
- `CATEGORY_HAS_DEPENDENCIES`
- `CIRCULAR_REFERENCE`

#### Products
- `SKU_ALREADY_EXISTS`
- `INSUFFICIENT_STOCK`
- `PRODUCT_INACTIVE`

#### Orders
- `ORDER_NOT_FOUND`
- `ORDER_ALREADY_CANCELLED`
- `CANNOT_CANCEL_ORDER`

#### Promotions
- `PROMO_CODE_INVALID`
- `PROMO_CODE_EXPIRED`
- `PROMO_CODE_LIMIT_REACHED`
- `PROMO_MIN_AMOUNT_NOT_MET`

#### Wallets
- `INSUFFICIENT_BALANCE`
- `WALLET_NOT_ACTIVE`

### Enums

#### UserRole
- `CLIENT`
- `ADMIN`

#### UserStatus
- `ACTIVE`
- `SUSPENDED`
- `DELETED`

#### Language
- `FR`, `EN`, `AR`, `ES`, `BM`

#### Theme
- `LIGHT`, `DARK`, `SYSTEM`

#### ProductType
- `GIFT_CARD`
- `PHYSICAL_PRODUCT`
- `BOTH`

#### OrderStatus
- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`
- `REFUNDED`

#### PaymentStatus
- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`
- `REFUNDED`

#### PaymentMethod
- `WAVE`

#### GiftCardStatus
- `PENDING`
- `ACTIVE`
- `USED`
- `EXPIRED`
- `CANCELLED`

#### WavePaymentStatus
- `PENDING`
- `PROCESSING`
- `SUCCESS`
- `FAILED`
- `TIMEOUT`
- `CANCELLED`

#### TrackingStatus
- `PREPARING`
- `SHIPPED`
- `IN_TRANSIT`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `FAILED`
- `RETURNED`

#### TransactionType
- `CREDIT`
- `DEBIT`
- `REFUND`
- `BONUS`
- `CASHBACK`
- `ADMIN_CREDIT`
- `ADMIN_DEBIT`
- `ORDER_PAYMENT`
- `REFERRAL_REWARD`

#### PromotionType
- `PERCENTAGE`
- `FIXED_AMOUNT`
- `FREE_SHIPPING`

#### ReferralStatus
- `PENDING`
- `ACTIVE`
- `COMPLETED`
- `EXPIRED`
- `CANCELLED`

#### RewardType
- `REFERRER_BONUS`
- `REFERRED_DISCOUNT`
- `LOYALTY_POINTS`
- `CASH_BACK`

#### RewardStatus
- `PENDING`
- `AVAILABLE`
- `CLAIMED`
- `EXPIRED`
- `CANCELLED`

### Variables d'environnement

```bash
# Application
NODE_ENV=production
APP_PORT=30010
APP_URL=https://yucard.generale-ci.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/yucard

# JWT
JWT_SECRET=your-jwt-secret-32-chars-min
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# Wave Payments
WAVE_API_URL=https://api.wave.com/v1
WAVE_API_KEY=your-wave-api-key
WAVE_WEBHOOK_SECRET=your-webhook-secret

# SMS (Termii)
TERMII_API_KEY=your-termii-api-key
SMS_SENDER_ID=Yu Card

# Storage
KEV_STORAGE_API_URL=https://apifiles.generale-ci.com/api
KEV_STORAGE_AUTH_TOKEN=your-storage-token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_STRICT_MAX=10
```

### Limits

- **Upload fichier** : 10MB max
- **Upload image** : 5MB max par fichier
- **Images produit** : 5 fichiers max
- **Avatar** : 2MB max
- **Pagination** : 100 éléments max par page
- **OTP** : 6 chiffres, expire en 5 minutes
- **JWT Access Token** : 15 minutes
- **JWT Refresh Token** : 365 jours

---

## 📞 SUPPORT

- **Health Check** : `GET https://yucard.generale-ci.com/health`
- **API Documentation** : `https://yucard.generale-ci.com/api-docs`
- **Logs** : `pm2 logs yu-card-api`

---

## 🔖 Légende

- 🔒 : Authentification requise
- 👨‍💼 : Accès admin uniquement

---

*Documentation complète mise à jour - Version 2.0.0*
*Dernière mise à jour : 2 janvier 2025*
*Tous les modules, routes et champs vérifiés avec le code source réel*
