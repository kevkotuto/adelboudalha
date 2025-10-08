# Yu Card Backend API

API Backend pour l'application Yu Card - Plateforme de cartes cadeaux et produits en Côte d'Ivoire.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20.9.0+
- PostgreSQL 14+
- Redis 6+
- Elasticsearch 8+

### Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd yu-card-backend
```

2. Installer les dépendances
```bash
pnpm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Modifier .env avec vos configurations
```

4. Lancer les migrations de base de données
```bash
npx prisma migrate dev
npx prisma generate
```

5. Démarrer le serveur
```bash
# Développement
pnpm dev
# Pour les jobs en parallèle
pnpm dev:jobs

# Production avec PM2 (recommandé)
pnpm build
pnpm run pm2:start  # Démarre API + Jobs
pnpm run pm2:status # Vérifier le statut
pnpm run pm2:logs   # Voir les logs

# Production simple
pnpm start          # API seulement
pnpm start:jobs     # Jobs seulement
```

## 📚 Documentation

- **API Documentation**: http://localhost:30010/api
- **Swagger UI**: http://localhost:30010/api-docs
- **Health Check**: http://localhost:30010/health

## 🔗 Routes CRUD

### Authentification (`/api/auth`)

#### Inscription & Connexion
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/profile` - Obtenir le profil utilisateur

#### Vérification OTP
- `POST /api/auth/verify-otp` - Vérifier le code OTP
- `POST /api/auth/resend-otp` - Renvoyer le code OTP

#### Réinitialisation mot de passe
- `POST /api/auth/forgot-password` - Demander réinitialisation
- `POST /api/auth/reset-password` - Réinitialiser mot de passe
- `POST /api/auth/change-password` - Changer mot de passe (authentifié)

### Utilisateurs (`/api/users`)

#### Gestion du profil
- `PUT /api/users/profile` - Mettre à jour le profil
- `POST /api/users/avatar` - Uploader un avatar
- `DELETE /api/users/account` - Supprimer le compte

#### Adresses
- `GET /api/users/addresses` - Lister les adresses
- `POST /api/users/addresses` - Ajouter une adresse
- `PUT /api/users/addresses/:id` - Modifier une adresse
- `DELETE /api/users/addresses/:id` - Supprimer une adresse

#### Préférences
- `GET /api/users/preferences` - Obtenir les préférences
- `PUT /api/users/preferences` - Mettre à jour les préférences

#### Statistiques
- `GET /api/users/stats` - Statistiques utilisateur
- `GET /api/users/stats/:userId` - Statistiques d'un utilisateur (admin only)

### Catégories (`/api/categories`)

#### CRUD Catégories
- `GET /api/categories` - Lister toutes les catégories (avec hiérarchie, pagination, filtres)
- `GET /api/categories/:id` - Obtenir une catégorie par ID (avec produits optionnels)
- `GET /api/categories/slug/:slug` - Obtenir une catégorie par slug
- `POST /api/categories` - Créer une nouvelle catégorie (admin only)
- `PUT /api/categories/:id` - Modifier une catégorie (admin only)
- `DELETE /api/categories/:id` - Supprimer une catégorie (admin only)

#### Fonctionnalités avancées
- Support de la hiérarchie parent/enfant
- Prévention des références circulaires
- Génération automatique de slugs uniques
- Comptage des produits par catégorie
- Filtrage par type de produit (GIFT_CARD, PHYSICAL_PRODUCT, BOTH)

### Produits Physiques (`/api/products`)

#### CRUD Produits
- `GET /api/products` - Lister tous les produits (avec pagination, filtres)
- `GET /api/products/featured` - Produits en vedette
- `GET /api/products/popular` - Produits populaires
- `POST /api/products` - Créer un nouveau produit (admin only)
- `GET /api/products/:id` - Obtenir un produit par ID ou slug
- `PUT /api/products/:id` - Modifier un produit (admin only)
- `DELETE /api/products/:id` - Supprimer un produit (admin only)

#### Images et relations
- `POST /api/products/:id/images` - Uploader des images produit (admin only)
- `GET /api/products/:id/related` - Obtenir les produits similaires

#### Gestion du stock
- `PATCH /api/products/:id/stock` - Mettre à jour le stock (admin only)

### Paiements Wave (`/api/payments/wave`)

#### Gestion des paiements
- `POST /api/payments/wave/initiate` - Initier un paiement Wave
- `POST /api/payments/wave/confirm/:paymentId` - Confirmer un paiement
- `GET /api/payments/wave/status/:transactionId` - Vérifier le statut d'un paiement
- `POST /api/payments/wave/webhook` - Webhook Wave pour les notifications
- `POST /api/payments/wave/retry/:paymentId` - Relancer un paiement échoué
- `POST /api/payments/wave/cancel/:paymentId` - Annuler un paiement
- `GET /api/payments/wave/history` - Historique des paiements utilisateur

#### Vérification automatique des paiements
- **Background Job** - Vérification automatique toutes les 30 secondes
- **Retry automatique** - Maximum 3 tentatives par paiement
- **Activation automatique** - Les cartes cadeaux sont activées automatiquement après paiement réussi
- **Synchronisation DB** - Mise à jour automatique du statut des commandes

### Recherche Avancée (`/api/search`)

#### Recherche intelligente
- `GET /api/search` - Recherche globale (produits + cartes cadeaux)
- `GET /api/search/autocomplete` - Autocomplétion de recherche
- `GET /api/search/category/:categoryId` - Recherche dans une catégorie
- `GET /api/search/trending` - Recherches et produits tendances

#### Gestion et administration
- `GET /api/search/history` - Historique de recherche (authentifié)
- `DELETE /api/search/history` - Effacer l'historique de recherche
- `GET /api/search/analytics` - Analytiques de recherche (admin only)
- `POST /api/search/admin/init-indices` - Initialiser les indices Elasticsearch (admin)
- `POST /api/search/admin/reindex` - Réindexer les données (admin)
- `GET /api/search/health` - Vérification de santé du service de recherche

### Upload de fichiers (`/api/upload`)

#### Images
- `POST /api/upload/image` - Uploader une image simple
- `POST /api/upload/images` - Uploader plusieurs images
- `POST /api/upload/product-images` - Uploader des images de produits (optimisées)
- `POST /api/upload/gift-card-images` - Uploader des images de cartes cadeaux
- `POST /api/upload/avatar` - Uploader un avatar utilisateur

#### Documents et validation
- `POST /api/upload/document` - Uploader un document
- `POST /api/upload/validate` - Valider un fichier avant upload

#### Gestion des fichiers
- `DELETE /api/upload/file/:filename` - Supprimer un fichier
- `GET /api/upload/config` - Obtenir la configuration d'upload
- `GET /api/upload/storage-info` - Info de stockage (admin only)
- `POST /api/upload/cleanup-temp` - Nettoyer les fichiers temporaires (admin)
- `GET /api/upload/health` - Vérification de santé du service d'upload

### Administration (`/api/admin`)

> **Note**: Nécessite le rôle ADMIN

#### Dashboard & Statistiques
- `GET /api/admin/dashboard` - Statistiques du dashboard
- `GET /api/admin/reports/financial` - Rapports financiers détaillés

#### Gestion des utilisateurs
- `GET /api/admin/users` - Lister tous les utilisateurs (avec pagination et filtres)
- `PATCH /api/admin/users/:userId/status` - Modifier le statut d'un utilisateur

#### Gestion des commandes
- `GET /api/admin/orders` - Lister toutes les commandes (avec pagination et filtres)
- `PATCH /api/admin/orders/:orderId/status` - Mettre à jour le statut d'une commande

## 🔒 Authentification

La plupart des endpoints nécessitent une authentification JWT. Utilisez le header:
```
Authorization: Bearer <votre_token>
```

### Rôles utilisateur
- `CLIENT` - Utilisateur standard
- `ADMIN` - Administrateur avec accès complet

## 📋 Format des réponses

Toutes les réponses suivent le format standard:

```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "string",
  "errors": ["string"]
}
```

### Réponses paginées
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🔍 Pagination & Filtrage

### Paramètres de pagination
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre d'éléments par page (défaut: 20, max: 100)

### Paramètres de recherche
- `q` - Terme de recherche
- `sort` - Tri (relevance, price_asc, price_desc, rating, popularity, newest)
- `category` - Filtrer par catégorie
- `brand` - Filtrer par marque
- `min_price` / `max_price` - Fourchette de prix

## 🚨 Gestion des erreurs

### Codes d'erreur HTTP
- `400` - Bad Request (données invalides)
- `401` - Unauthorized (non authentifié)
- `403` - Forbidden (accès refusé)
- `404` - Not Found (ressource introuvable)
- `422` - Unprocessable Entity (erreur de validation)
- `429` - Too Many Requests (limite de taux dépassée)
- `500` - Internal Server Error (erreur serveur)

### Format des erreurs de validation
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Le champ email est requis",
    "Le mot de passe doit contenir au moins 8 caractères"
  ]
}
```

## 🔧 Configuration

### Variables d'environnement principales

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/yucard"

# JWT
JWT_SECRET="votre-secret-jwt"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Elasticsearch
ELASTICSEARCH_NODE="http://localhost:9200"

# SMS (Termii)
TERMII_API_KEY="votre-cle-api-termii"

# Wave Money
WAVE_API_KEY="votre-cle-api-wave"
WAVE_API_SECRET="votre-secret-wave"

# AWS S3 (pour upload)
AWS_ACCESS_KEY_ID="votre-access-key"
AWS_SECRET_ACCESS_KEY="votre-secret-key"
AWS_S3_BUCKET="votre-bucket"

# App
APP_PORT=30010
APP_URL="http://localhost:30010"
NODE_ENV="development"
```

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests d'intégration
pnpm test:integration

# Couverture de code
pnpm test:coverage
```

## 🔄 Gestion des Jobs Background

Le système inclut des jobs automatisés pour la vérification des paiements et autres tâches.

### Commandes PM2
```bash
# Démarrer tous les services (API + Jobs)
pnpm run pm2:start

# Arrêter tous les services
pnpm run pm2:stop

# Redémarrer les services
pnpm run pm2:restart

# Recharger (sans downtime)
pnpm run pm2:reload

# Supprimer les services
pnpm run pm2:delete

# Voir les logs en temps réel
pnpm run pm2:logs

# Voir le statut des services
pnpm run pm2:status
```

### Services PM2
- **yu-card-api** - Serveur API principal
- **yu-card-jobs** - Jobs de vérification des paiements

### Jobs automatiques
- **Vérification des paiements** - Toutes les 30 secondes
- **Nettoyage des anciennes données** - Tous les jours à 2h du matin
- **Health checks** - Toutes les 5 minutes

## 📦 Déploiement

### Build pour production
```bash
pnpm build
```

### Docker
```bash
# Construire l'image
docker build -t yu-card-backend .

# Lancer le conteneur
docker run -p 30010:30010 yu-card-backend
```

### Docker Compose
```bash
docker-compose up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence propriétaire - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour obtenir de l'aide:
- Email: support@yucard.ci
- Documentation: https://docs.yucard.ci
- Issues GitHub: [Yu Card Issues](https://github.com/yucard/backend/issues)

---

**Yu Card** - La plateforme de référence pour les cartes cadeaux et produits électroniques en Côte d'Ivoire 🇨🇮



// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ================================
// USER MANAGEMENT
// ================================

model User {
  id                      String   @id @default(uuid()) @db.Uuid
  phone                   String   @unique @db.VarChar(20)
  phoneVerified          Boolean  @default(false) @map("phone_verified")
  fullName               String   @map("full_name") @db.VarChar(100)
  email                   String?  @unique @db.VarChar(255)
  passwordHash           String   @map("password_hash") @db.VarChar(255)
  avatarUrl              String?  @map("avatar_url") @db.Text
  role                    UserRole @default(CLIENT)
  status                  UserStatus @default(ACTIVE)
  hasCompletedOnboarding Boolean  @default(false) @map("has_completed_onboarding")
  lastLoginAt            DateTime? @map("last_login_at") @db.Timestamptz
  failedLoginAttempts    Int      @default(0) @map("failed_login_attempts")
  lockedUntil            DateTime? @map("locked_until") @db.Timestamptz
  createdAt              DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt              DateTime @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  preferences           UserPreference?
  addresses             UserAddress[]
  cartItems             CartItem[]
  orders                Order[]
  giftCardCodes         GiftCardCode[]
  usedGiftCardCodes     GiftCardCode[] @relation("UsedByUser")
  reviews               ProductReview[]
  favorites             Favorite[]
  notifications         Notification[]
  sessions              Session[]
  passwordResets        PasswordReset[]
  auditLogs             AuditLog[]
  promotionUsages       PromotionUsage[]
  wallet                UserWallet?
  referralsAsReferrer   Referral[] @relation("ReferrerUser")
  referralsAsReferred   Referral[] @relation("ReferredUser")
  referralRewards       ReferralReward[]
  walletTransactions    WalletTransaction[]
  adminTransactions     WalletTransaction[] @relation("AdminTransactions")

  @@index([phone])
  @@index([role])
  @@index([status])
  @@index([email])
  @@map("users")
}

model UserPreference {
  id                    String    @id @default(uuid()) @db.Uuid
  userId                String    @unique @map("user_id") @db.Uuid
  language              Language  @default(FR)
  notificationsEnabled  Boolean   @default(true) @map("notifications_enabled")
  newsletterEnabled     Boolean   @default(false) @map("newsletter_enabled")
  smsNotifications      Boolean   @default(true) @map("sms_notifications")
  emailNotifications    Boolean   @default(true) @map("email_notifications")
  pushNotifications     Boolean   @default(true) @map("push_notifications")
  theme                 Theme     @default(SYSTEM)
  createdAt             DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

model UserAddress {
  id           String      @id @default(uuid()) @db.Uuid
  userId       String      @map("user_id") @db.Uuid
  fullName     String      @map("full_name") @db.VarChar(100)
  phone        String      @db.VarChar(20)
  addressLine1 String      @map("address_line1") @db.VarChar(255)
  addressLine2 String?     @map("address_line2") @db.VarChar(255)
  city         String      @db.VarChar(100)
  stateProvince String?    @map("state_province") @db.VarChar(100)
  postalCode   String?     @map("postal_code") @db.VarChar(20)
  country      String      @default("CI") @db.VarChar(2)
  isDefault    Boolean     @default(false) @map("is_default")
  type         AddressType @default(SHIPPING)
  createdAt    DateTime    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime    @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  user           User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  shippingOrders Order[] @relation("ShippingAddress")
  billingOrders  Order[] @relation("BillingAddress")

  @@index([userId])
  @@map("user_addresses")
}

// ================================
// PRODUCT CATALOG
// ================================

model Category {
  id           String    @id @default(uuid()) @db.Uuid
  name         String    @db.VarChar(100)
  slug         String    @unique @db.VarChar(100)
  type         ProductType
  description  String?   @db.Text
  iconUrl      String?   @map("icon_url") @db.Text
  parentId     String?   @map("parent_id") @db.Uuid
  displayOrder Int       @default(0) @map("display_order")
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  parent          Category?       @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children        Category[]      @relation("CategoryHierarchy")
  giftCards       GiftCard[]
  physicalProducts PhysicalProduct[]

  @@index([slug])
  @@index([parentId])
  @@index([type])
  @@index([isActive])
  @@map("categories")
}

model GiftCard {
  id                   String    @id @default(uuid()) @db.Uuid
  title                String    @db.VarChar(255)
  brand                String    @db.VarChar(100)
  slug                 String    @unique @db.VarChar(255)
  categoryId           String?   @map("category_id") @db.Uuid
  description          String?   @db.Text
  termsConditions      String?   @map("terms_conditions") @db.Text
  usageInstructions    String?   @map("usage_instructions") @db.Text
  imageUrl             String    @map("image_url") @db.Text
  backgroundImageUrl   String?   @map("background_image_url") @db.Text
  backgroundColor      String?   @map("background_color") @db.VarChar(7)
  gradientStart        String?   @map("gradient_start") @db.VarChar(7)
  gradientEnd          String?   @map("gradient_end") @db.VarChar(7)
  minAmount            Decimal?  @map("min_amount") @db.Decimal(10, 2)
  maxAmount            Decimal?  @map("max_amount") @db.Decimal(10, 2)
  fixedAmounts         Json?     @map("fixed_amounts") @db.JsonB
  currency             String    @default("XOF") @db.VarChar(3)
  discountPercentage   Decimal   @default(0) @map("discount_percentage") @db.Decimal(5, 2)
  isPopular            Boolean   @default(false) @map("is_popular")
  isFeatured           Boolean   @default(false) @map("is_featured")
  isActive             Boolean   @default(true) @map("is_active")
  stockQuantity        Int       @default(-1) @map("stock_quantity")
  validityDays         Int       @default(365) @map("validity_days")
  region               String?   @db.VarChar(2)
  displayOrder         Int       @default(0) @map("display_order")
  metaKeywords         String[]  @map("meta_keywords")
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  category      Category?       @relation(fields: [categoryId], references: [id])
  cartItems     CartItem[]
  orderItems    OrderItem[]
  giftCardCodes GiftCardCode[]
  reviews       ProductReview[]
  favorites     Favorite[]

  @@index([brand])
  @@index([categoryId])
  @@index([isPopular])
  @@index([isActive])
  @@index([slug])
  @@map("gift_cards")
}

model PhysicalProduct {
  id                String    @id @default(uuid()) @db.Uuid
  name              String    @db.VarChar(255)
  brand             String    @db.VarChar(100)
  slug              String    @unique @db.VarChar(255)
  categoryId        String?   @map("category_id") @db.Uuid
  description       String?   @db.Text
  price             Decimal   @db.Decimal(10, 2)
  originalPrice     Decimal?  @map("original_price") @db.Decimal(10, 2)
  currency          String    @default("XOF") @db.VarChar(3)
  discountPercentage Decimal  @default(0) @map("discount_percentage") @db.Decimal(5, 2)
  stockQuantity     Int       @default(0) @map("stock_quantity")
  sku               String?   @unique @db.VarChar(100)
  weightKg          Decimal?  @map("weight_kg") @db.Decimal(10, 3)
  dimensionsCm      Json?     @map("dimensions_cm") @db.JsonB
  specifications    Json?     @db.JsonB
  images            Json      @db.JsonB
  isPopular         Boolean   @default(false) @map("is_popular")
  isFeatured        Boolean   @default(false) @map("is_featured")
  isActive          Boolean   @default(true) @map("is_active")
  deliveryTimeDays  Int       @default(3) @map("delivery_time_days")
  warrantyMonths    Int       @default(12) @map("warranty_months")
  rating            Decimal   @default(0) @db.Decimal(2, 1)
  reviewCount       Int       @default(0) @map("review_count")
  displayOrder      Int       @default(0) @map("display_order")
  metaKeywords      String[]  @map("meta_keywords")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  category   Category?       @relation(fields: [categoryId], references: [id])
  cartItems  CartItem[]
  orderItems OrderItem[]
  reviews    ProductReview[]
  favorites  Favorite[]

  @@index([brand])
  @@index([categoryId])
  @@index([price])
  @@index([isPopular])
  @@index([isActive])
  @@index([slug])
  @@index([sku])
  @@map("physical_products")
}

// ================================
// SHOPPING CART & ORDERS
// ================================

model CartItem {
  id                 String    @id @default(uuid()) @db.Uuid
  userId             String    @map("user_id") @db.Uuid
  productType        ProductType @map("product_type")
  giftCardId         String?   @map("gift_card_id") @db.Uuid
  physicalProductId  String?   @map("physical_product_id") @db.Uuid
  quantity           Int       @default(1)
  giftCardAmount     Decimal?  @map("gift_card_amount") @db.Decimal(10, 2)
  addedAt            DateTime  @default(now()) @map("added_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  giftCard        GiftCard?        @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  physicalProduct PhysicalProduct? @relation(fields: [physicalProductId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([giftCardId])
  @@index([physicalProductId])
  @@map("cart_items")
}

model Order {
  id                String       @id @default(uuid()) @db.Uuid
  orderNumber       String       @unique @map("order_number") @db.VarChar(20)
  userId            String       @map("user_id") @db.Uuid
  status            OrderStatus  @default(PENDING)
  subtotal          Decimal      @db.Decimal(10, 2)
  shippingCost      Decimal      @default(0) @map("shipping_cost") @db.Decimal(10, 2)
  taxAmount         Decimal      @default(0) @map("tax_amount") @db.Decimal(10, 2)
  discountAmount    Decimal      @default(0) @map("discount_amount") @db.Decimal(10, 2)
  totalAmount       Decimal      @map("total_amount") @db.Decimal(10, 2)
  currency          String       @default("XOF") @db.VarChar(3)
  paymentMethod     PaymentMethod @default(WAVE) @map("payment_method")
  paymentStatus     PaymentStatus @default(PENDING) @map("payment_status")
  shippingAddressId String?      @map("shipping_address_id") @db.Uuid
  billingAddressId  String?      @map("billing_address_id") @db.Uuid
  contactPhone      String?      @map("contact_phone") @db.VarChar(20)
  notes             String?      @db.Text
  cancelledReason   String?      @map("cancelled_reason") @db.Text
  cancelledAt       DateTime?    @map("cancelled_at") @db.Timestamptz
  confirmedAt       DateTime?    @map("confirmed_at") @db.Timestamptz
  shippedAt         DateTime?    @map("shipped_at") @db.Timestamptz
  deliveredAt       DateTime?    @map("delivered_at") @db.Timestamptz
  createdAt         DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  user            User          @relation(fields: [userId], references: [id])
  shippingAddress UserAddress?  @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
  billingAddress  UserAddress?  @relation("BillingAddress", fields: [billingAddressId], references: [id])
  items           OrderItem[]
  wavePayments    WavePayment[]
  tracking        OrderTracking?
  promotionUsages PromotionUsage[]
  referrals       Referral[]
  referralRewards ReferralReward[]
  walletTransactions WalletTransaction[]

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt(sort: Desc)])
  @@map("orders")
}

model OrderItem {
  id                String    @id @default(uuid()) @db.Uuid
  orderId           String    @map("order_id") @db.Uuid
  productType       ProductType @map("product_type")
  giftCardId        String?   @map("gift_card_id") @db.Uuid
  physicalProductId String?   @map("physical_product_id") @db.Uuid
  productName       String    @map("product_name") @db.VarChar(255)
  productBrand      String?   @map("product_brand") @db.VarChar(100)
  productImage      String?   @map("product_image") @db.Text
  quantity          Int       @default(1)
  unitPrice         Decimal   @map("unit_price") @db.Decimal(10, 2)
  giftCardAmount    Decimal?  @map("gift_card_amount") @db.Decimal(10, 2)
  discountAmount    Decimal   @default(0) @map("discount_amount") @db.Decimal(10, 2)
  totalPrice        Decimal   @map("total_price") @db.Decimal(10, 2)
  currency          String    @default("XOF") @db.VarChar(3)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  order           Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  giftCard        GiftCard?        @relation(fields: [giftCardId], references: [id])
  physicalProduct PhysicalProduct? @relation(fields: [physicalProductId], references: [id])
  giftCardCodes   GiftCardCode[]
  reviews         ProductReview[]

  @@index([orderId])
  @@index([giftCardId])
  @@index([physicalProductId])
  @@map("order_items")
}

// ================================
// GIFT CARD CODES
// ================================

model GiftCardCode {
  id           String           @id @default(uuid()) @db.Uuid
  code         String           @unique @db.VarChar(20)
  orderItemId  String?          @map("order_item_id") @db.Uuid
  giftCardId   String           @map("gift_card_id") @db.Uuid
  userId       String?          @map("user_id") @db.Uuid
  amount       Decimal          @db.Decimal(10, 2)
  currency     String           @default("XOF") @db.VarChar(3)
  status       GiftCardStatus   @default(PENDING)
  activationDate DateTime?      @map("activation_date") @db.Timestamptz
  expiryDate   DateTime?        @map("expiry_date") @db.Timestamptz
  usedDate     DateTime?        @map("used_date") @db.Timestamptz
  usedByUserId String?          @map("used_by_user_id") @db.Uuid
  createdAt    DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime         @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  orderItem   OrderItem? @relation(fields: [orderItemId], references: [id], onDelete: SetNull)
  giftCard    GiftCard   @relation(fields: [giftCardId], references: [id])
  user        User?      @relation(fields: [userId], references: [id])
  usedByUser  User?      @relation("UsedByUser", fields: [usedByUserId], references: [id])

  @@index([code])
  @@index([userId])
  @@index([status])
  @@index([orderItemId])
  @@map("gift_card_codes")
}

// ================================
// PAYMENTS
// ================================

model WavePayment {
  id                 String           @id @default(uuid()) @db.Uuid
  orderId            String           @map("order_id") @db.Uuid
  transactionId      String?          @unique @map("transaction_id") @db.VarChar(100)
  phoneNumber        String           @map("phone_number") @db.VarChar(20)
  amount             Decimal          @db.Decimal(10, 2)
  currency           String           @default("XOF") @db.VarChar(3)
  status             WavePaymentStatus @default(PENDING)
  waveReference      String?          @map("wave_reference") @db.VarChar(100)
  waveTransactionId  String?          @map("wave_transaction_id") @db.VarChar(100)
  errorMessage       String?          @map("error_message") @db.Text
  errorCode          String?          @map("error_code") @db.VarChar(50)
  initiatedAt        DateTime         @default(now()) @map("initiated_at") @db.Timestamptz
  completedAt        DateTime?        @map("completed_at") @db.Timestamptz
  webhookData        Json?            @map("webhook_data") @db.JsonB
  retryCount         Int              @default(0) @map("retry_count")
  lastRetryAt        DateTime?        @map("last_retry_at") @db.Timestamptz
  createdAt          DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime         @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  order Order @relation(fields: [orderId], references: [id])

  @@index([orderId])
  @@index([transactionId])
  @@index([phoneNumber])
  @@index([status])
  @@index([waveReference])
  @@map("wave_payments")
}

// ================================
// ORDER TRACKING
// ================================

model OrderTracking {
  id                String            @id @default(uuid()) @db.Uuid
  orderId           String            @unique @map("order_id") @db.Uuid
  trackingNumber    String?           @unique @map("tracking_number") @db.VarChar(100)
  carrier           String?           @db.VarChar(100)
  status            TrackingStatus    @default(PREPARING)
  currentLocation   String?           @map("current_location") @db.Text
  estimatedDelivery DateTime?         @map("estimated_delivery") @db.Date
  actualDelivery    DateTime?         @map("actual_delivery") @db.Timestamptz
  signatureUrl      String?           @map("signature_url") @db.Text
  notes             String?           @db.Text
  createdAt         DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime          @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  order  Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  events TrackingEvent[]

  @@index([orderId])
  @@index([trackingNumber])
  @@index([status])
  @@map("order_tracking")
}

model TrackingEvent {
  id               String        @id @default(uuid()) @db.Uuid
  orderTrackingId  String        @map("order_tracking_id") @db.Uuid
  eventDate        DateTime      @map("event_date") @db.Timestamptz
  status           String        @db.VarChar(100)
  description      String        @db.Text
  location         String?       @db.Text
  createdAt        DateTime      @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  orderTracking OrderTracking @relation(fields: [orderTrackingId], references: [id], onDelete: Cascade)

  @@index([orderTrackingId])
  @@index([eventDate(sort: Desc)])
  @@map("tracking_events")
}

// ================================
// REVIEWS & FAVORITES
// ================================

model ProductReview {
  id                   String    @id @default(uuid()) @db.Uuid
  userId               String    @map("user_id") @db.Uuid
  productType          ProductType @map("product_type")
  giftCardId           String?   @map("gift_card_id") @db.Uuid
  physicalProductId    String?   @map("physical_product_id") @db.Uuid
  orderItemId          String?   @map("order_item_id") @db.Uuid
  rating               Int       @db.SmallInt
  title                String?   @db.VarChar(255)
  comment              String?   @db.Text
  images               Json?     @db.JsonB
  isVerifiedPurchase   Boolean   @default(false) @map("is_verified_purchase")
  isVisible            Boolean   @default(true) @map("is_visible")
  helpfulCount         Int       @default(0) @map("helpful_count")
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  user            User             @relation(fields: [userId], references: [id])
  giftCard        GiftCard?        @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  physicalProduct PhysicalProduct? @relation(fields: [physicalProductId], references: [id], onDelete: Cascade)
  orderItem       OrderItem?       @relation(fields: [orderItemId], references: [id])

  @@unique([userId, orderItemId])
  @@index([userId])
  @@index([giftCardId])
  @@index([physicalProductId])
  @@index([rating])
  @@index([isVisible])
  @@map("product_reviews")
}

model Favorite {
  id                String    @id @default(uuid()) @db.Uuid
  userId            String    @map("user_id") @db.Uuid
  productType       ProductType @map("product_type")
  giftCardId        String?   @map("gift_card_id") @db.Uuid
  physicalProductId String?   @map("physical_product_id") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  giftCard        GiftCard?        @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  physicalProduct PhysicalProduct? @relation(fields: [physicalProductId], references: [id], onDelete: Cascade)

  @@unique([userId, giftCardId])
  @@unique([userId, physicalProductId])
  @@index([userId])
  @@index([giftCardId])
  @@index([physicalProductId])
  @@map("favorites")
}

// ================================
// NOTIFICATIONS
// ================================

model Notification {
  id        String             @id @default(uuid()) @db.Uuid
  userId    String             @map("user_id") @db.Uuid
  type      NotificationType
  title     String             @db.VarChar(255)
  message   String             @db.Text
  data      Json?              @db.JsonB
  isRead    Boolean            @default(false) @map("is_read")
  readAt    DateTime?          @map("read_at") @db.Timestamptz
  channel   NotificationChannel
  sentAt    DateTime?          @map("sent_at") @db.Timestamptz
  createdAt DateTime           @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@index([type])
  @@index([createdAt(sort: Desc)])
  @@map("notifications")
}

// ================================
// AUTHENTICATION & SESSIONS
// ================================

model Session {
  id                 String    @id @default(uuid()) @db.Uuid
  userId             String    @map("user_id") @db.Uuid
  tokenHash          String    @unique @map("token_hash") @db.VarChar(255)
  refreshTokenHash   String?   @unique @map("refresh_token_hash") @db.VarChar(255)
  deviceInfo         Json?     @map("device_info") @db.JsonB
  ipAddress          String?   @map("ip_address") @db.Inet
  userAgent          String?   @map("user_agent") @db.Text
  expiresAt          DateTime  @map("expires_at") @db.Timestamptz
  refreshExpiresAt   DateTime? @map("refresh_expires_at") @db.Timestamptz
  isActive           Boolean   @default(true) @map("is_active")
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  lastActivityAt     DateTime  @default(now()) @map("last_activity_at") @db.Timestamptz

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([refreshTokenHash])
  @@index([expiresAt])
  @@index([isActive])
  @@map("sessions")
}

model PasswordReset {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @unique @map("token_hash") @db.VarChar(255)
  code      String?   @db.VarChar(6)
  expiresAt DateTime  @map("expires_at") @db.Timestamptz
  used      Boolean   @default(false)
  usedAt    DateTime? @map("used_at") @db.Timestamptz
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([code])
  @@index([expiresAt])
  @@map("password_resets")
}

model OtpVerification {
  id         String      @id @default(uuid()) @db.Uuid
  phone      String      @db.VarChar(20)
  code       String      @db.VarChar(6)
  type       OtpType
  attempts   Int         @default(0)
  verified   Boolean     @default(false)
  expiresAt  DateTime    @map("expires_at") @db.Timestamptz
  verifiedAt DateTime?   @map("verified_at") @db.Timestamptz
  createdAt  DateTime    @default(now()) @map("created_at") @db.Timestamptz

  @@index([phone])
  @@index([code])
  @@index([expiresAt])
  @@map("otp_verifications")
}

// ================================
// PROMOTIONS
// ================================

model Promotion {
  id                 String           @id @default(uuid()) @db.Uuid
  code               String?          @unique @db.VarChar(50)
  name               String           @db.VarChar(255)
  description        String?          @db.Text
  type               PromotionType
  value              Decimal          @db.Decimal(10, 2)
  minPurchaseAmount  Decimal?         @map("min_purchase_amount") @db.Decimal(10, 2)
  maxDiscountAmount  Decimal?         @map("max_discount_amount") @db.Decimal(10, 2)
  applicableTo       PromotionScope   @default(ALL) @map("applicable_to")
  productIds         Json?            @map("product_ids") @db.JsonB
  usageLimit         Int?             @map("usage_limit")
  usageCount         Int              @default(0) @map("usage_count")
  usagePerCustomer   Int              @default(1) @map("usage_per_customer")
  validFrom          DateTime?        @map("valid_from") @db.Timestamptz
  validUntil         DateTime?        @map("valid_until") @db.Timestamptz
  isActive           Boolean          @default(true) @map("is_active")
  createdAt          DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime         @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  usages PromotionUsage[]
  walletTransactions WalletTransaction[]

  @@index([code])
  @@index([isActive])
  @@index([validFrom, validUntil])
  @@map("promotions")
}

model PromotionUsage {
  id             String    @id @default(uuid()) @db.Uuid
  promotionId    String    @map("promotion_id") @db.Uuid
  userId         String    @map("user_id") @db.Uuid
  orderId        String    @map("order_id") @db.Uuid
  discountAmount Decimal   @map("discount_amount") @db.Decimal(10, 2)
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  promotion Promotion @relation(fields: [promotionId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
  order     Order     @relation(fields: [orderId], references: [id])

  @@unique([promotionId, orderId])
  @@index([promotionId])
  @@index([userId])
  @@index([orderId])
  @@map("promotion_usages")
}

// ================================
// REFERRAL SYSTEM
// ================================

model Referral {
  id                String        @id @default(uuid()) @db.Uuid
  referrerUserId    String        @map("referrer_user_id") @db.Uuid
  referredUserId    String?       @map("referred_user_id") @db.Uuid
  referralCode      String        @unique @map("referral_code") @db.VarChar(20)
  status            ReferralStatus @default(PENDING)
  bonusType         BonusType     @map("bonus_type")
  bonusValue        Decimal       @map("bonus_value") @db.Decimal(10, 2)
  minPurchaseAmount Decimal?      @map("min_purchase_amount") @db.Decimal(10, 2)
  appliedAt         DateTime?     @map("applied_at") @db.Timestamptz
  expiresAt         DateTime?     @map("expires_at") @db.Timestamptz
  firstOrderId      String?       @map("first_order_id") @db.Uuid
  metadata          Json?         @db.JsonB
  createdAt         DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime      @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  referrer      User              @relation("ReferrerUser", fields: [referrerUserId], references: [id])
  referred      User?             @relation("ReferredUser", fields: [referredUserId], references: [id])
  firstOrder    Order?            @relation(fields: [firstOrderId], references: [id])
  rewards       ReferralReward[]
  walletTransactions WalletTransaction[]

  @@index([referrerUserId])
  @@index([referredUserId])
  @@index([referralCode])
  @@index([status])
  @@index([createdAt])
  @@map("referrals")
}

model ReferralReward {
  id              String       @id @default(uuid()) @db.Uuid
  referralId      String       @map("referral_id") @db.Uuid
  userId          String       @map("user_id") @db.Uuid
  rewardType      RewardType   @map("reward_type")
  rewardValue     Decimal      @map("reward_value") @db.Decimal(10, 2)
  status          RewardStatus @default(PENDING)
  appliedOrderId  String?      @map("applied_order_id") @db.Uuid
  description     String?      @db.Text
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz
  claimedAt       DateTime?    @map("claimed_at") @db.Timestamptz
  expiresAt       DateTime?    @map("expires_at") @db.Timestamptz

  // Relations
  referral     Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id])
  appliedOrder Order?   @relation(fields: [appliedOrderId], references: [id])

  @@index([referralId])
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
  @@map("referral_rewards")
}

// ================================
// WALLET SYSTEM
// ================================

model UserWallet {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @unique @map("user_id") @db.Uuid
  balance         Decimal  @default(0) @db.Decimal(10, 2)
  pendingBalance  Decimal  @default(0) @map("pending_balance") @db.Decimal(10, 2)
  totalEarned     Decimal  @default(0) @map("total_earned") @db.Decimal(10, 2)
  totalSpent      Decimal  @default(0) @map("total_spent") @db.Decimal(10, 2)
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions WalletTransaction[]

  @@index([userId])
  @@index([isActive])
  @@map("user_wallets")
}

model WalletTransaction {
  id            String          @id @default(uuid()) @db.Uuid
  walletId      String          @map("wallet_id") @db.Uuid
  userId        String          @map("user_id") @db.Uuid
  type          TransactionType
  amount        Decimal         @db.Decimal(10, 2)
  balanceBefore Decimal         @map("balance_before") @db.Decimal(10, 2)
  balanceAfter  Decimal         @map("balance_after") @db.Decimal(10, 2)
  description   String          @db.Text
  reference     String?         @db.VarChar(100)
  orderId       String?         @map("order_id") @db.Uuid
  referralId    String?         @map("referral_id") @db.Uuid
  promotionId   String?         @map("promotion_id") @db.Uuid
  adminUserId   String?         @map("admin_user_id") @db.Uuid
  metadata      Json?           @db.JsonB
  createdAt     DateTime        @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  wallet    UserWallet @relation(fields: [walletId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id])
  order     Order?     @relation(fields: [orderId], references: [id])
  referral  Referral?  @relation(fields: [referralId], references: [id])
  promotion Promotion? @relation(fields: [promotionId], references: [id])
  adminUser User?      @relation("AdminTransactions", fields: [adminUserId], references: [id])

  @@index([walletId])
  @@index([userId])
  @@index([type])
  @@index([createdAt(sort: Desc)])
  @@index([orderId])
  @@index([referralId])
  @@map("wallet_transactions")
}

// ================================
// AUDIT & LOGS
// ================================

model AuditLog {
  id         String    @id @default(uuid()) @db.Uuid
  userId     String?   @map("user_id") @db.Uuid
  action     String    @db.VarChar(100)
  entityType String?   @map("entity_type") @db.VarChar(50)
  entityId   String?   @map("entity_id") @db.Uuid
  oldValues  Json?     @map("old_values") @db.JsonB
  newValues  Json?     @map("new_values") @db.JsonB
  ipAddress  String?   @map("ip_address") @db.Inet
  userAgent  String?   @map("user_agent") @db.Text
  metadata   Json?     @db.JsonB
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt(sort: Desc)])
  @@map("audit_logs")
}

// ================================
// ENUMS
// ================================

enum UserRole {
  CLIENT
  ADMIN

  @@map("user_role")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED

  @@map("user_status")
}

enum Language {
  FR
  EN
  AR
  ES
  BM

  @@map("language")
}

enum Theme {
  LIGHT
  DARK
  SYSTEM

  @@map("theme")
}

enum AddressType {
  SHIPPING
  BILLING
  BOTH

  @@map("address_type")
}

enum ProductType {
  GIFT_CARD
  PHYSICAL_PRODUCT
  BOTH

  @@map("product_type")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED

  @@map("order_status")
}

enum PaymentMethod {
  WAVE

  @@map("payment_method")
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED

  @@map("payment_status")
}

enum GiftCardStatus {
  PENDING
  ACTIVE
  USED
  EXPIRED
  CANCELLED

  @@map("gift_card_status")
}

enum WavePaymentStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  TIMEOUT
  CANCELLED

  @@map("wave_payment_status")
}

enum TrackingStatus {
  PREPARING
  SHIPPED
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED
  RETURNED

  @@map("tracking_status")
}

enum NotificationType {
  ORDER
  PAYMENT
  DELIVERY
  PROMOTION
  SYSTEM
  GIFT_CARD

  @@map("notification_type")
}

enum NotificationChannel {
  PUSH
  EMAIL
  SMS
  IN_APP

  @@map("notification_channel")
}

enum OtpType {
  REGISTRATION
  LOGIN
  PASSWORD_RESET
  PHONE_VERIFICATION

  @@map("otp_type")
}

enum PromotionType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
  GIFT

  @@map("promotion_type")
}

enum PromotionScope {
  ALL
  GIFT_CARDS
  PHYSICAL_PRODUCTS
  SPECIFIC_PRODUCTS

  @@map("promotion_scope")
}

enum ReferralStatus {
  PENDING
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED

  @@map("referral_status")
}

enum BonusType {
  PERCENTAGE
  FIXED_AMOUNT

  @@map("bonus_type")
}

enum RewardType {
  REFERRER_BONUS
  REFERRED_DISCOUNT
  LOYALTY_POINTS
  CASH_BACK

  @@map("reward_type")
}

enum RewardStatus {
  PENDING
  AVAILABLE
  CLAIMED
  EXPIRED
  CANCELLED

  @@map("reward_status")
}

enum TransactionType {
  CREDIT
  DEBIT
  REFUND
  BONUS
  CASHBACK
  ADMIN_CREDIT
  ADMIN_DEBIT
  ORDER_PAYMENT
  REFERRAL_REWARD

  @@map("transaction_type")
}