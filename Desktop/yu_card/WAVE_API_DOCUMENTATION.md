# Documentation API Wave - Yu Card Backend

## Vue d'ensemble

Cette documentation décrit l'intégration complète de l'API Wave pour le système Yu Card, incluant les paiements, balance, transactions, payouts et deep linking mobile.

### URLs importantes

- **Base URL API** : `https://yucard.generale-ci.com/api`
- **Webhook URL** : `https://yucard.generale-ci.com/api/payments/webhook`
- **Documentation Swagger** : `https://yucard.generale-ci.com/api-docs`
- **Deep Link Android** : `https://yucard.generale-ci.com/.well-known/assetlinks.json`
- **Deep Link iOS** : `https://yucard.generale-ci.com/apple-app-site-association`

### Authentication

La plupart des endpoints nécessitent une authentification JWT :

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📱 ENDPOINTS DE PAIEMENT

### 1. Initier un paiement

**POST** `/api/payments/initiate`

Crée une session de paiement Wave pour une commande.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Body (JSON)
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

#### Réponse de succès (201)
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "456e7890-e89b-12d3-a456-426614174001",
    "waveUrl": "https://checkout.wave.com/session/cos-123abc456def",
    "amount": 10000,
    "currency": "XOF",
    "expiresAt": "2024-01-01T18:00:00.000Z"
  }
}
```

#### Erreurs possibles
- `400` : Montant invalide ou commande non éligible
- `403` : Accès refusé à cette commande
- `404` : Commande introuvable
- `409` : Paiement déjà initié pour cette commande

---

### 2. Confirmer un paiement

**POST** `/api/payments/confirm/{paymentId}`

Vérifie le statut d'un paiement auprès de Wave.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `paymentId` (string, UUID) : ID du paiement à confirmer

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/confirm/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Payment status updated",
  "data": {
    "payment": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "status": "SUCCESS",
      "amount": 10000,
      "completedAt": "2024-01-01T17:45:00.000Z",
      "errorMessage": null
    },
    "order": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "orderNumber": "YC-2024-001",
      "totalAmount": 10000,
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED"
    }
  }
}
```

---

### 3. Obtenir le statut d'un paiement

**GET** `/api/payments/status/{transactionId}`

Récupère le statut d'un paiement par transaction ID ou Wave reference.

#### Headers (optionnel)
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `transactionId` (string) : Transaction ID ou Wave reference

#### Exemple de requête
```bash
curl https://yucard.generale-ci.com/api/payments/status/cos-123abc456def \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "status": "SUCCESS",
      "amount": 10000,
      "currency": "XOF",
      "initiatedAt": "2024-01-01T17:30:00.000Z",
      "completedAt": "2024-01-01T17:45:00.000Z",
      "errorMessage": null
    },
    "order": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "orderNumber": "YC-2024-001",
      "userId": "user-123",
      "totalAmount": 10000,
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED"
    }
  }
}
```

---

### 4. Relancer un paiement échoué

**POST** `/api/payments/retry/{paymentId}`

Relance un paiement qui a échoué.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `paymentId` (string, UUID) : ID du paiement à relancer

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/retry/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Payment retry initiated",
  "data": {
    "paymentId": "456e7890-e89b-12d3-a456-426614174001",
    "waveUrl": "https://checkout.wave.com/session/cos-789xyz123ghi",
    "retryCount": 1
  }
}
```

#### Erreurs possibles
- `400` : Paiement déjà réussi ou tentatives épuisées (max 3)
- `403` : Accès refusé
- `404` : Paiement introuvable

---

### 5. Annuler un paiement

**POST** `/api/payments/cancel/{paymentId}`

Annule un paiement en cours.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `paymentId` (string, UUID) : ID du paiement à annuler

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/cancel/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "payment": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "status": "CANCELLED"
    }
  }
}
```

---

### 6. Historique des paiements

**GET** `/api/payments/history`

Récupère l'historique des paiements de l'utilisateur.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de requête (optionnels)
- `page` (integer, défaut: 1) : Numéro de page
- `limit` (integer, défaut: 20) : Nombre d'éléments par page
- `status` (string) : Filtrer par statut (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)

#### Exemple de requête
```bash
curl "https://yucard.generale-ci.com/api/payments/history?page=1&limit=10&status=SUCCESS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "orderId": "123e4567-e89b-12d3-a456-426614174000",
        "transactionId": "txn-123",
        "phoneNumber": "+225XXXXXXXX",
        "amount": 10000,
        "currency": "XOF",
        "status": "SUCCESS",
        "waveReference": "cos-123abc456def",
        "initiatedAt": "2024-01-01T17:30:00.000Z",
        "completedAt": "2024-01-01T17:45:00.000Z",
        "retryCount": 0,
        "order": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "orderNumber": "YC-2024-001",
          "totalAmount": 10000,
          "status": "CONFIRMED",
          "createdAt": "2024-01-01T17:00:00.000Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

## 💰 ENDPOINTS BALANCE & TRANSACTIONS

### 1. Consultation du solde Wave

**GET** `/api/payments/balance`

Récupère le solde du portefeuille Wave.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de requête (optionnels)
- `include_subaccounts` (boolean, défaut: false) : Inclure les sous-comptes

#### Exemple de requête
```bash
curl "https://yucard.generale-ci.com/api/payments/balance?include_subaccounts=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Wave balance retrieved successfully",
  "data": {
    "amount": "150000",
    "currency": "XOF"
  }
}
```

---

### 2. Liste des transactions Wave

**GET** `/api/payments/transactions`

Récupère la liste des transactions Wave.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de requête (optionnels)
- `date` (string, format: YYYY-MM-DD) : Date spécifique
- `after` (string) : Curseur de pagination
- `include_subaccounts` (boolean, défaut: false) : Inclure les sous-comptes

#### Exemple de requête
```bash
curl "https://yucard.generale-ci.com/api/payments/transactions?date=2024-01-01&include_subaccounts=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Wave transactions retrieved successfully",
  "data": {
    "page_info": {
      "start_cursor": null,
      "end_cursor": "cursor_123",
      "has_next_page": true
    },
    "date": "2024-01-01",
    "items": [
      {
        "timestamp": "2024-01-01T17:45:00.000Z",
        "transaction_id": "txn_abc123",
        "transaction_type": "checkout_payment",
        "amount": "10000",
        "fee": "250",
        "balance": "140000",
        "currency": "XOF",
        "is_reversal": false,
        "counterparty_name": "Client Name",
        "counterparty_mobile": "+225XXXXXXXX",
        "client_reference": "yucard_order_123",
        "checkout_api_session_id": "cos-123abc456def"
      }
    ]
  }
}
```

---

### 3. Remboursement d'une transaction

**POST** `/api/payments/transactions/{transactionId}/refund`

Effectue le remboursement d'une transaction Wave.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `transactionId` (string) : ID de la transaction Wave à rembourser

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/transactions/txn_abc123/refund \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Transaction refunded successfully",
  "data": {
    "transaction_id": "txn_abc123",
    "refunded_at": "2024-01-01T18:00:00.000Z"
  }
}
```

---

## 💸 ENDPOINTS PAYOUT (ENVOI D'ARGENT)

### 1. Créer un payout

**POST** `/api/payments/payout`

Envoie de l'argent vers un numéro de téléphone mobile.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Body (JSON)
```json
{
  "currency": "XOF",
  "receive_amount": "5000",
  "mobile": "+2250586987934",
  "name": "Nom du bénéficiaire",
  "national_id": "CI123456789",
  "client_reference": "refund_order_123",
  "payment_reason": "Remboursement"
}
```

#### Champs obligatoires
- `currency` : Devise (XOF)
- `receive_amount` : Montant à recevoir (string)
- `mobile` : Numéro de téléphone (+225XXXXXXXX)

#### Champs optionnels
- `name` : Nom du bénéficiaire
- `national_id` : Numéro d'identification nationale
- `client_reference` : Référence client
- `payment_reason` : Raison du paiement (max 40 caractères)

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/payout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "XOF",
    "receive_amount": "5000",
    "mobile": "+2250586987934",
    "name": "John Doe",
    "payment_reason": "Remboursement"
  }'
```

#### Réponse de succès (201)
```json
{
  "success": true,
  "message": "Payout created successfully",
  "data": {
    "id": "payout_xyz789",
    "currency": "XOF",
    "receive_amount": "5000",
    "fee": "100",
    "mobile": "+2250586987934",
    "name": "John Doe",
    "status": "processing",
    "timestamp": "2024-01-01T18:00:00.000Z",
    "payout_error": null
  }
}
```

---

### 2. Statut d'un payout

**GET** `/api/payments/payout/{payoutId}`

Vérifie le statut d'un payout.

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `payoutId` (string) : ID du payout Wave

#### Exemple de requête
```bash
curl https://yucard.generale-ci.com/api/payments/payout/payout_xyz789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Payout status retrieved successfully",
  "data": {
    "id": "payout_xyz789",
    "currency": "XOF",
    "receive_amount": "5000",
    "fee": "100",
    "mobile": "+2250586987934",
    "name": "John Doe",
    "status": "succeeded",
    "timestamp": "2024-01-01T18:05:00.000Z",
    "payout_error": null
  }
}
```

#### Statuts possibles
- `processing` : En cours de traitement
- `succeeded` : Réussi
- `failed` : Échoué
- `reversed` : Annulé

---

### 3. Annuler un payout

**POST** `/api/payments/payout/{payoutId}/reverse`

Annule un payout (si possible).

#### Headers requis
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Paramètres de chemin
- `payoutId` (string) : ID du payout à annuler

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/payout/payout_xyz789/reverse \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Payout reversed successfully",
  "data": {
    "payout_id": "payout_xyz789",
    "reversed_at": "2024-01-01T18:10:00.000Z"
  }
}
```

---

## 🔗 WEBHOOK WAVE

### Réception des notifications Wave

**POST** `/api/payments/webhook`

Endpoint pour recevoir les notifications de Wave. Utilisé automatiquement par Wave.

#### Headers requis
```
Wave-Signature: sha256=HMAC_SIGNATURE
Content-Type: application/json
```

#### Body (JSON) - Exemples

##### Paiement réussi
```json
{
  "type": "checkout.session.completed",
  "data": {
    "id": "cos-123abc456def",
    "amount": 10000,
    "currency": "XOF",
    "payment_status": "successful",
    "checkout_status": "complete",
    "client_reference": "yucard_order_123",
    "when_completed": "2024-01-01T17:45:00.000Z"
  },
  "created": 1704131100
}
```

##### Paiement échoué
```json
{
  "type": "checkout.session.failed",
  "data": {
    "id": "cos-123abc456def",
    "amount": 10000,
    "currency": "XOF",
    "payment_status": "failed",
    "checkout_status": "complete",
    "client_reference": "yucard_order_123",
    "last_payment_error": {
      "message": "Insufficient funds",
      "type": "card_declined"
    }
  },
  "created": 1704131100
}
```

#### Réponse attendue (200)
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

#### Types de webhooks supportés
- `checkout.session.completed` : Paiement réussi
- `checkout.session.failed` : Paiement échoué
- `checkout.session.cancelled` : Paiement annulé
- `payout.completed` : Payout réussi
- `payout.failed` : Payout échoué

---

## 📄 PAGES DE PAIEMENT & DEEP LINKING

### 1. Page de succès

**GET** `/api/payments/success`

Page HTML affichée après un paiement réussi avec deep linking.

#### Paramètres de requête
- `sessionId` (string, optionnel) : ID de session Wave
- `orderId` (string, optionnel) : ID de commande

#### URL d'exemple
```
https://yucard.generale-ci.com/payment/success?sessionId=cos-123abc456def&orderId=123e4567-e89b-12d3-a456-426614174000
```

#### Fonctionnalités
- ✅ Affichage des détails de transaction
- ✅ Bouton "Ouvrir dans l'app" (deep link: `yucard://payment/success?sessionId=xxx`)
- ✅ Bouton "Imprimer la facture"
- ✅ Récupération automatique des détails via API

---

### 2. Page d'erreur

**GET** `/api/payments/error`

Page HTML affichée après un paiement échoué avec deep linking.

#### Paramètres de requête
- `sessionId` (string, optionnel) : ID de session Wave
- `orderId` (string, optionnel) : ID de commande

#### URL d'exemple
```
https://yucard.generale-ci.com/payment/error?sessionId=cos-123abc456def&orderId=123e4567-e89b-12d3-a456-426614174000
```

#### Fonctionnalités
- ❌ Affichage des détails d'erreur
- 🔄 Bouton "Réessayer"
- 📱 Bouton "Ouvrir dans l'app" (deep link: `yucard://payment/error?sessionId=xxx`)

---

### 3. Détails de session (API)

**GET** `/api/payments/session/{sessionId}`

API utilisée par les pages succès/erreur pour récupérer les détails.

#### Paramètres de chemin
- `sessionId` (string) : ID de session Wave

#### Authentification
Aucune authentification requise (accès public pour les pages de résultat).

#### Exemple de requête
```bash
curl https://yucard.generale-ci.com/api/payments/session/cos-123abc456def
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "data": {
    "sessionId": "cos-123abc456def",
    "amount": 10000,
    "currency": "XOF",
    "paymentStatus": "successful",
    "checkoutStatus": "complete",
    "completedAt": "2024-01-01T17:45:00.000Z",
    "expiredAt": null,
    "lastError": null,
    "order": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "orderNumber": "YC-2024-001",
      "totalAmount": 10000,
      "currency": "XOF",
      "status": "CONFIRMED",
      "paymentStatus": "COMPLETED",
      "createdAt": "2024-01-01T17:00:00.000Z",
      "items": [
        {
          "quantity": 1,
          "unitPrice": 10000,
          "giftCard": {
            "title": "Carte Cadeau Orange",
            "description": "Carte cadeau Orange Money 10,000 XOF"
          },
          "physicalProduct": null
        }
      ]
    },
    "payment": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "status": "SUCCESS",
      "initiatedAt": "2024-01-01T17:30:00.000Z",
      "completedAt": "2024-01-01T17:45:00.000Z",
      "phoneNumber": "+225XXXX****"
    }
  }
}
```

---

## 📱 CONFIGURATION DEEP LINKING

### Android (assetlinks.json)

**URL** : `https://yucard.generale-ci.com/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "ci.yucard.app",
      "sha256_cert_fingerprints": [
        "YOUR_APP_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

### iOS (apple-app-site-association)

**URL** : `https://yucard.generale-ci.com/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.ci.yucard.app",
        "paths": [
          "/payment/success",
          "/payment/error",
          "/payment/*"
        ]
      }
    ]
  }
}
```

### Schémas de Deep Link

- **Succès** : `yucard://payment/success?sessionId={sessionId}&orderId={orderId}`
- **Erreur** : `yucard://payment/error?sessionId={sessionId}&orderId={orderId}`

---

## 🧪 ENDPOINTS DE TEST

### 1. Test des routes Wave

**GET** `/api/payments/test`

Vérifie que les routes Wave fonctionnent.

#### Exemple de requête
```bash
curl https://yucard.generale-ci.com/api/payments/test
```

#### Réponse (200)
```json
{
  "success": true,
  "message": "Wave routes are working!"
}
```

---

### 2. Créer un paiement test

**POST** `/api/payments/create-test-payment`

Crée un paiement test avec Wave (100 XOF).

#### Exemple de requête
```bash
curl -X POST https://yucard.generale-ci.com/api/payments/create-test-payment
```

#### Réponse de succès (200)
```json
{
  "success": true,
  "message": "Real Wave test payment created successfully!",
  "data": {
    "session_id": "cos-test123456",
    "wave_launch_url": "https://checkout.wave.com/session/cos-test123456",
    "amount": 100,
    "currency": "XOF",
    "restrict_payer_mobile": "+2250586987934",
    "expires_at": "2024-01-01T18:00:00.000Z",
    "checkout_status": "open",
    "payment_status": "pending",
    "instructions": "Open wave_launch_url on mobile device with Wave app installed to complete payment"
  }
}
```

---

## 🔐 VALIDATION DES SIGNATURES WEBHOOK

Wave signe ses webhooks avec HMAC SHA256. La validation est automatique mais voici le processus :

### Calcul de la signature
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}
```

### Headers Wave
```
Wave-Signature: sha256=abc123def456...
```

---

## ❌ CODES D'ERREUR COMMUNS

### Codes HTTP
- **400** : Requête invalide (données manquantes/incorrectes)
- **401** : Non authentifié (token manquant/invalide)
- **403** : Accès refusé (pas d'autorisation)
- **404** : Ressource introuvable
- **409** : Conflit (paiement déjà initié)
- **429** : Trop de requêtes (rate limiting)
- **500** : Erreur serveur interne
- **503** : Service Wave indisponible

### Codes d'erreur métier
- `ORDER_NOT_FOUND` : Commande introuvable
- `PAYMENT_NOT_FOUND` : Paiement introuvable
- `ACCESS_DENIED` : Accès refusé à cette ressource
- `AMOUNT_TOO_LOW` : Montant inférieur au minimum (100 XOF)
- `AMOUNT_TOO_HIGH` : Montant supérieur au maximum (5,000,000 XOF)
- `INVALID_PHONE_NUMBER` : Format de téléphone invalide pour la Côte d'Ivoire
- `PAYMENT_ALREADY_INITIATED` : Paiement déjà en cours pour cette commande
- `PAYMENT_ALREADY_COMPLETED` : Paiement déjà terminé
- `MAX_RETRIES_EXCEEDED` : Nombre maximum de tentatives atteint (3)
- `WAVE_SERVICE_ERROR` : Erreur de communication avec Wave
- `INVALID_SIGNATURE` : Signature webhook invalide

---

## 🔧 CONFIGURATION REQUISE

### Variables d'environnement (.env)
```bash
# Wave Configuration
WAVE_API_URL="https://api.wave.com/v1"
WAVE_API_KEY="wave_ci_prod_..."
WAVE_MERCHANT_ID="Lorient Plus"
WAVE_WEBHOOK_SECRET="wave_ci_WHS_..."
WAVE_SANDBOX="false"

# Application URLs
APP_URL="https://yucard.generale-ci.com"
FRONTEND_URL="https://yucard.generale-ci.com"
```

### Limites configurées
- **Montant minimum** : 100 XOF
- **Montant maximum** : 5,000,000 XOF
- **Tentatives de retry** : 3 maximum
- **Timeout Wave** : 30 secondes
- **Rate limiting** : 100 req/15min (général), 10 req/15min (auth/payments)

---

## 📞 SUPPORT

Pour toute question technique ou problème d'intégration :

- **Documentation Swagger** : `https://yucard.generale-ci.com/api-docs`
- **Logs** : Consultez les logs PM2 avec `pm2 logs yu-card-api`
- **Health Check** : `https://yucard.generale-ci.com/health`

---

*Documentation générée automatiquement - Version 1.0.0*