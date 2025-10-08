# 📢 API de Gestion des Notifications Admin - Documentation Complète

## Base URL
```
http://localhost:30010/api/admin/notifications
```

**🔒 Authentification requise** : Toutes les routes nécessitent un token admin dans le header :
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 1. 📱 Envoyer une Notification PUSH

### Endpoint
```
POST /api/admin/notifications/push
```

### Description
Envoie une notification push Expo aux utilisateurs. Visible sur leurs smartphones via l'application mobile.

### Body (JSON)
```json
{
  "title": "string (required)",        // Titre de la notification (max 100 caractères)
  "message": "string (required)",      // Message de la notification (max 500 caractères)
  "userIds": ["uuid"],                 // Array d'IDs utilisateurs (optionnel, vide = tous)
  "type": "string",                    // Type : PROMOTION, SYSTEM, ORDER, PAYMENT, DELIVERY, GIFT_CARD (défaut: PROMOTION)
  "data": {}                           // Données additionnelles (optionnel, format libre JSON)
}
```

### Exemple de requête
```bash
curl -X POST http://localhost:30010/api/admin/notifications/push \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Nouvelle promotion !",
    "message": "Profitez de 20% de réduction sur toutes les cartes cadeaux PlayStation",
    "type": "PROMOTION",
    "data": {
      "promoCode": "PSN20",
      "validUntil": "2025-02-10"
    }
  }'
```

### Réponse (200 OK)
```json
{
  "success": true,
  "message": "Push notifications sent",
  "data": {
    "total": 150,        // Nombre total d'utilisateurs ciblés
    "sent": 145,         // Notifications envoyées avec succès
    "failed": 5          // Échecs (token invalide, etc.)
  }
}
```

### Cas d'usage
- ✅ Annoncer une nouvelle promotion
- ✅ Informer d'une mise à jour de l'application
- ✅ Alerter d'un événement spécial
- ✅ Rappeler une offre limitée

---

## 2. 📲 Envoyer un SMS

### Endpoint
```
POST /api/admin/notifications/sms
```

### Description
Envoie un SMS via Termii aux numéros de téléphone des utilisateurs. **Attention** : Coûte des crédits SMS.

### Body (JSON)
```json
{
  "message": "string (required)",      // Message SMS (max 160 caractères)
  "userIds": ["uuid"],                 // Array d'IDs utilisateurs (optionnel)
  "phoneNumbers": ["+2250708123456"]   // Array de numéros directs (optionnel, override userIds)
}
```

### Exemple de requête
```bash
curl -X POST http://localhost:30010/api/admin/notifications/sms \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "YuCard: Promo flash 30% sur PSN et iTunes jusqu'\''à minuit ! Ne ratez pas ça 🔥"
  }'
```

### Exemple avec numéros spécifiques
```bash
curl -X POST http://localhost:30010/api/admin/notifications/sms \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "YuCard: Votre commande VIP est prête pour retrait !",
    "phoneNumbers": ["+2250708123456", "+2250709876543"]
  }'
```

### Réponse (200 OK)
```json
{
  "success": true,
  "message": "SMS notifications sent",
  "data": {
    "total": 100,
    "sent": 98,
    "failed": 2
  }
}
```

### ⚠️ Important
- **Limite** : 160 caractères max (contrainte SMS standard)
- **Coût** : Chaque SMS consomme des crédits Termii
- **Format** : Éviter les emojis complexes (certains comptent pour 2 caractères)

### Cas d'usage
- ✅ Promotions urgentes / flash sales
- ✅ Alertes importantes (maintenance, fermeture exceptionnelle)
- ✅ Notifications VIP pour clients premium
- ✅ Rappels de commandes en attente

---

## 3. 🌐 Broadcast Multi-Canal (Push + SMS + In-App)

### Endpoint
```
POST /api/admin/notifications/broadcast
```

### Description
**LA SOLUTION ULTIME** : Envoie une notification via plusieurs canaux simultanément. Garantit que le message atteint l'utilisateur par au moins un moyen.

### Body (JSON)
```json
{
  "title": "string (required)",       // Titre (max 100 caractères)
  "message": "string (required)",     // Message (max 500 caractères)
  "userIds": ["uuid"],                // Array d'IDs (optionnel, vide = tous)
  "channels": ["PUSH", "SMS", "IN_APP"], // Canaux à utiliser (défaut: tous les 3)
  "type": "string",                   // Type de notification (défaut: PROMOTION)
  "data": {}                          // Données additionnelles (optionnel)
}
```

### Exemple de requête - Promo Exceptionnelle
```bash
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Promotion Exceptionnelle 48H",
    "message": "30% de réduction sur TOUTES les cartes PSN, iTunes et Google Play. Valable 48h seulement !",
    "channels": ["PUSH", "SMS", "IN_APP"],
    "type": "PROMOTION",
    "data": {
      "promoCode": "FLASH30",
      "validUntil": "2025-02-08T23:59:59Z",
      "categories": ["PSN", "iTunes", "GooglePlay"]
    }
  }'
```

### Exemple - Notification Système (Push + In-App uniquement)
```bash
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "⚠️ Maintenance Programmée",
    "message": "Le service sera indisponible le 10/02 de 2h à 4h pour maintenance. Merci de votre compréhension.",
    "channels": ["PUSH", "IN_APP"],
    "type": "SYSTEM"
  }'
```

### Exemple - Ciblage spécifique
```bash
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎁 Cadeau Spécial VIP",
    "message": "Vous avez été sélectionné pour recevoir 5000 XOF de crédit gratuit !",
    "userIds": ["user-uuid-1", "user-uuid-2", "user-uuid-3"],
    "channels": ["PUSH", "SMS", "IN_APP"],
    "type": "PROMOTION",
    "data": {
      "creditAmount": 5000,
      "expiresAt": "2025-03-01"
    }
  }'
```

### Réponse (200 OK)
```json
{
  "success": true,
  "message": "Broadcast notification sent",
  "data": {
    "totalUsers": 250,
    "channels": ["PUSH", "SMS", "IN_APP"],
    "stats": {
      "pushSent": 240,
      "pushFailed": 10,
      "smsSent": 245,
      "smsFailed": 5,
      "inAppCreated": 250
    }
  }
}
```

### 💡 Stratégies de canaux recommandées

#### Option 1 : Maximum Impact (Tous les canaux)
```json
"channels": ["PUSH", "SMS", "IN_APP"]
```
- **Quand** : Promotions majeures, événements importants
- **Avantage** : Taux de lecture maximal
- **Coût** : Élevé (SMS facturé)

#### Option 2 : Équilibré (Push + In-App)
```json
"channels": ["PUSH", "IN_APP"]
```
- **Quand** : Notifications régulières, updates
- **Avantage** : Bon équilibre coût/efficacité
- **Coût** : Gratuit

#### Option 3 : Économique (In-App uniquement)
```json
"channels": ["IN_APP"]
```
- **Quand** : Infos non urgentes, historique
- **Avantage** : Totalement gratuit
- **Coût** : Aucun

### Cas d'usage
- ✅ Lancements de produits majeurs
- ✅ Promotions flash limitées dans le temps
- ✅ Événements spéciaux (Black Friday, Noël)
- ✅ Alertes critiques (sécurité, maintenance)
- ✅ Campagnes marketing ciblées

---

## 4. 📊 Historique des Notifications

### Endpoint
```
GET /api/admin/notifications/history
```

### Description
Consulte l'historique complet des notifications envoyées avec filtres avancés.

### Query Parameters
```
page=1                           // Numéro de page (défaut: 1)
limit=20                         // Résultats par page (défaut: 20, max: 100)
type=PROMOTION                   // Filtrer par type (optionnel)
channel=PUSH                     // Filtrer par canal (optionnel)
startDate=2025-02-01            // Date de début (ISO format, optionnel)
endDate=2025-02-28              // Date de fin (ISO format, optionnel)
```

### Exemple de requête
```bash
# Toutes les notifications de promotion du mois
curl -X GET "http://localhost:30010/api/admin/notifications/history?type=PROMOTION&startDate=2025-02-01&endDate=2025-02-28&limit=50" \
  -H "Authorization: Bearer eyJhbGc..."

# Toutes les notifications push envoyées aujourd'hui
curl -X GET "http://localhost:30010/api/admin/notifications/history?channel=PUSH&startDate=2025-02-06" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Réponse (200 OK)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-123",
        "title": "🎉 Nouvelle promotion !",
        "message": "Profitez de 20% de réduction...",
        "type": "PROMOTION",
        "channel": "PUSH",
        "sentAt": "2025-02-06T10:30:00Z",
        "createdAt": "2025-02-06T10:29:45Z",
        "isRead": true,
        "user": {
          "id": "user-uuid",
          "fullName": "Jean Kouassi",
          "phone": "+2250708123456"
        }
      }
      // ... plus de notifications
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1540,
      "totalPages": 77,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Cas d'usage
- ✅ Analyser les campagnes passées
- ✅ Vérifier qu'une notification a été envoyée
- ✅ Identifier les utilisateurs qui ont reçu une promo
- ✅ Audit et traçabilité

---

## 5. 📈 Statistiques des Notifications

### Endpoint
```
GET /api/admin/notifications/stats
```

### Description
Obtient des statistiques détaillées sur les notifications : taux de lecture, répartition par type et canal.

### Query Parameters
```
startDate=2025-02-01            // Date de début (optionnel)
endDate=2025-02-28              // Date de fin (optionnel)
```

### Exemple de requête
```bash
# Stats du mois en cours
curl -X GET "http://localhost:30010/api/admin/notifications/stats?startDate=2025-02-01" \
  -H "Authorization: Bearer eyJhbGc..."

# Stats globales (toutes périodes)
curl -X GET "http://localhost:30010/api/admin/notifications/stats" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Réponse (200 OK)
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalNotifications": 5430,
      "totalRead": 4250,
      "totalUnread": 1180,
      "readRate": "78.26"          // Taux de lecture en %
    },
    "byType": [
      {
        "type": "PROMOTION",
        "count": 2500
      },
      {
        "type": "ORDER",
        "count": 1800
      },
      {
        "type": "SYSTEM",
        "count": 890
      },
      {
        "type": "PAYMENT",
        "count": 240
      }
    ],
    "byChannel": [
      {
        "channel": "PUSH",
        "count": 3200
      },
      {
        "channel": "SMS",
        "count": 1500
      },
      {
        "channel": "IN_APP",
        "count": 730
      }
    ],
    "recentActivity": [
      {
        "id": "notif-uuid",
        "title": "Promo Flash",
        "type": "PROMOTION",
        "channel": "PUSH",
        "createdAt": "2025-02-06T15:30:00Z",
        "sentAt": "2025-02-06T15:30:05Z"
      }
      // ... 10 dernières notifications
    ]
  }
}
```

### Cas d'usage
- ✅ Mesurer l'engagement des utilisateurs
- ✅ Comparer l'efficacité des canaux (Push vs SMS)
- ✅ Identifier les types de notifications les plus lus
- ✅ Reporting mensuel pour la direction
- ✅ Optimiser les coûts SMS

---

## 6. 🧪 Test de Notification

### Endpoint
```
POST /api/admin/notifications/test/:userId
```

### Description
Envoie une notification de test à un utilisateur spécifique. **Idéal pour valider** avant un envoi massif.

### URL Parameters
```
userId (required)               // UUID de l'utilisateur cible
```

### Body (JSON)
```json
{
  "channel": "PUSH"              // Canal : PUSH, SMS ou IN_APP (défaut: PUSH)
}
```

### Exemple de requête
```bash
# Test Push
curl -X POST http://localhost:30010/api/admin/notifications/test/41b92f7b-10e2-43c4-8c3a-084532bc781f \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "PUSH"
  }'

# Test SMS
curl -X POST http://localhost:30010/api/admin/notifications/test/41b92f7b-10e2-43c4-8c3a-084532bc781f \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "SMS"
  }'

# Test In-App
curl -X POST http://localhost:30010/api/admin/notifications/test/41b92f7b-10e2-43c4-8c3a-084532bc781f \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "IN_APP"
  }'
```

### Réponse (200 OK)
```json
{
  "success": true,
  "message": "Test notification sent via PUSH",
  "data": {
    "userId": "41b92f7b-10e2-43c4-8c3a-084532bc781f",
    "userName": "Jean Kouassi",
    "channel": "PUSH"
  }
}
```

### Réponse (400 Bad Request)
```json
{
  "success": false,
  "message": "User has no push token"
}
```

### Cas d'usage
- ✅ Tester avant un broadcast massif
- ✅ Vérifier la configuration Expo/Termii
- ✅ Valider le format d'un message
- ✅ Tester avec différents utilisateurs (iOS vs Android)

---

## 📋 Types de Notifications (field: `type`)

```typescript
type NotificationType =
  | "PROMOTION"      // Promotions, offres spéciales, réductions
  | "SYSTEM"         // Alertes système, maintenance, updates
  | "ORDER"          // Statut commande, livraison, confirmation
  | "PAYMENT"        // Paiement réussi, échec, remboursement
  | "DELIVERY"       // Tracking colis, livraison en cours
  | "GIFT_CARD"      // Codes disponibles, activation
```

### Quand utiliser chaque type ?

| Type | Exemples | Priorité | Fréquence recommandée |
|------|----------|----------|----------------------|
| **PROMOTION** | Promo flash, soldes, nouveautés | Moyenne | 1-2 par semaine max |
| **SYSTEM** | Maintenance, bugs critiques, updates | Haute | Occasionnel uniquement |
| **ORDER** | "Commande confirmée", "En livraison" | Haute | Automatique par commande |
| **PAYMENT** | "Paiement réussi", "Échec paiement" | Très haute | Automatique par transaction |
| **DELIVERY** | "Colis expédié", "Livré" | Haute | Automatique par livraison |
| **GIFT_CARD** | "Vos codes sont disponibles" | Très haute | Automatique après paiement |

---

## 📋 Canaux de Notification (field: `channels`)

### 1. PUSH (Expo Push Notifications)
- **Gratuit** : Oui
- **Livraison** : Instantanée (< 5 secondes)
- **Taux d'ouverture** : 10-15%
- **Nécessite** : Token Expo Push valide
- **Visible** : Badge + popup sur smartphone
- **Limites** : Aucune (rate limit Expo)

### 2. SMS (Termii)
- **Gratuit** : Non (consomme crédits)
- **Livraison** : Très rapide (< 10 secondes)
- **Taux d'ouverture** : 90-98%
- **Nécessite** : Numéro de téléphone valide
- **Visible** : Application SMS native
- **Limites** : 160 caractères, coût par message

### 3. IN_APP
- **Gratuit** : Oui
- **Livraison** : Instantanée
- **Taux d'ouverture** : Variable (si user ouvre l'app)
- **Nécessite** : Rien (toujours disponible)
- **Visible** : Onglet Notifications dans l'app
- **Limites** : User doit ouvrir l'app

---

## 🎯 Scénarios d'Utilisation Pratiques

### Scénario 1 : Promo Flash 24h
**Objectif** : Maximum de visibilité pour une vente flash

```bash
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "⚡ FLASH SALE 24H",
    "message": "50% sur PSN et Xbox ! Plus que 24h, stock limité. Foncez !",
    "channels": ["PUSH", "SMS"],
    "type": "PROMOTION",
    "data": {
      "discount": 50,
      "categories": ["PSN", "Xbox"],
      "endsAt": "2025-02-07T23:59:59Z"
    }
  }'
```
**Pourquoi** : SMS + Push = taux d'ouverture maximal. In-App exclu car non urgent.

---

### Scénario 2 : Maintenance Programmée
**Objectif** : Informer sans dépenser en SMS

```bash
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔧 Maintenance Prévue",
    "message": "Le site sera en maintenance demain de 3h à 5h. Les commandes en cours ne seront pas affectées.",
    "channels": ["PUSH", "IN_APP"],
    "type": "SYSTEM"
  }'
```
**Pourquoi** : Info importante mais pas urgente. SMS non nécessaire.

---

### Scénario 3 : Récompense Clients VIP
**Objectif** : Notifier uniquement 10 clients premium

```bash
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🏆 Cadeau Spécial VIP",
    "message": "Félicitations ! Vous recevez 10,000 XOF de crédit gratuit pour votre fidélité.",
    "userIds": [
      "uuid-vip-1",
      "uuid-vip-2",
      "uuid-vip-3",
      "uuid-vip-4",
      "uuid-vip-5",
      "uuid-vip-6",
      "uuid-vip-7",
      "uuid-vip-8",
      "uuid-vip-9",
      "uuid-vip-10"
    ],
    "channels": ["PUSH", "SMS", "IN_APP"],
    "type": "PROMOTION",
    "data": {
      "creditAmount": 10000,
      "vipTier": "gold"
    }
  }'
```
**Pourquoi** : Ciblage précis + tous les canaux car message important personnalisé.

---

### Scénario 4 : Nouvelle Catégorie de Produits
**Objectif** : Annoncer l'arrivée de cartes Steam

```bash
curl -X POST http://localhost:30010/api/admin/notifications/push \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎮 Nouveauté : Cartes Steam",
    "message": "Les cartes Steam sont enfin disponibles ! De 5€ à 100€, rechargez votre compte dès maintenant.",
    "type": "PROMOTION",
    "data": {
      "category": "Steam",
      "newProduct": true
    }
  }'
```
**Pourquoi** : Push uniquement = gratuit et suffisant pour une annonce produit.

---

### Scénario 5 : Test avant Black Friday
**Objectif** : Valider tout fonctionne avant l'envoi massif

```bash
# 1. Tester avec votre compte admin
curl -X POST http://localhost:30010/api/admin/notifications/test/VOTRE_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "PUSH"}'

# 2. Tester SMS avec un collègue
curl -X POST http://localhost:30010/api/admin/notifications/test/COLLEGUE_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "SMS"}'

# 3. Si OK, lancer le broadcast réel
curl -X POST http://localhost:30010/api/admin/notifications/broadcast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🖤 BLACK FRIDAY 2025",
    "message": "70% de réduction sur TOUT le site ! Valable 48h, ne ratez pas ça !",
    "channels": ["PUSH", "SMS"],
    "type": "PROMOTION"
  }'
```

---

## ⚠️ Bonnes Pratiques

### ✅ À FAIRE
- Tester avec `/test/:userId` avant un envoi massif
- Utiliser `type` approprié pour chaque notification
- Limiter les SMS aux messages urgents/importants (coût)
- Surveiller les stats via `/stats` pour optimiser
- Personnaliser le champ `data` pour le tracking
- Respecter 160 caractères max pour SMS
- Envoyer promotions en dehors des heures de sommeil (8h-22h)

### ❌ À ÉVITER
- Spam quotidien (max 2-3 notifications/semaine)
- SMS pour infos non urgentes (privilégier Push)
- Négliger les tests avant envoi massif
- Envoyer sans ciblage (`userIds` vide) par accident
- Messages trop longs pour SMS (tronqué à 160)
- Notifications la nuit (mauvaise UX)

---

## 🔐 Codes d'Erreur

| Code | Message | Solution |
|------|---------|----------|
| 401 | Access token required | Ajouter header Authorization |
| 403 | Admin access required | Utiliser un token admin valide |
| 400 | Title and message are required | Vérifier les champs obligatoires |
| 400 | Message too long | Réduire à 160 caractères (SMS) |
| 404 | No users found | Vérifier que userIds existent |
| 404 | User has no push token | User n'a pas configuré push |
| 500 | Failed to send notifications | Vérifier config Expo/Termii |

---

## 📊 Exemple de Monitoring

### Script pour suivre les stats hebdomadaires
```bash
#!/bin/bash
# monitoring-notifications.sh

TOKEN="YOUR_ADMIN_TOKEN"
START_DATE=$(date -d "7 days ago" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

echo "📊 Statistiques des 7 derniers jours"
echo "===================================="

curl -s -X GET "http://localhost:30010/api/admin/notifications/stats?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## 🎓 Résumé Rapide

| Besoin | Route | Méthode | Usage |
|--------|-------|---------|-------|
| Notification push uniquement | `/notifications/push` | POST | Annonce produit, update app |
| SMS uniquement | `/notifications/sms` | POST | Promo flash, urgent |
| Multi-canal (Push+SMS+In-App) | `/notifications/broadcast` | POST | Événement majeur, Black Friday |
| Voir historique | `/notifications/history` | GET | Audit, analyse campagne |
| Statistiques | `/notifications/stats` | GET | Reporting, optimisation |
| Test avant envoi | `/notifications/test/:userId` | POST | Validation avant broadcast |

---

## 💡 Support

- **Documentation API complète** : http://localhost:30010/api-docs
- **Logs backend** : `pm2 logs yu-card-api`
- **Test Expo Push** : https://expo.dev/notifications
- **Test Termii** : Dashboard Termii https://termii.com

---

**Créé le** : 2025-02-06
**Version API** : 1.0.0
**Dernière mise à jour** : 2025-02-06
