# Routes Backend Requises - Admin Orders & Gift Cards

## ⚠️ Routes manquantes détectées

D'après les logs d'erreur, voici les routes qui manquent ou qui ont des problèmes :

### ❌ Route 404 : GET /api/admin/orders/:orderId
**Erreur** : `Route not found`
**Utilisée par** : `adminOrdersService.getOrderDetails(orderId)`

---

## 📋 Liste complète des routes requises

### 1. Orders Management

#### ✅ GET /api/admin/orders
**Déjà implémenté** (fonctionne)

**Description** : Liste toutes les commandes avec filtres

**Query Parameters** :
```typescript
{
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  search?: string;
}
```

**Response** :
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "ORD-12345",
        "status": "CONFIRMED",
        "paymentStatus": "COMPLETED",
        "totalAmount": "50000",
        "createdAt": "2025-10-04T12:00:00Z",
        "user": {
          "id": "uuid",
          "fullName": "John Doe",
          "phone": "+2250700000000"
        },
        "items": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

#### ❌ GET /api/admin/orders/:orderId
**À CRÉER**

**Description** : Récupère les détails complets d'une commande

**URL** : `/api/admin/orders/:orderId`

**Method** : `GET`

**Response** :
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-12345",
    "status": "CONFIRMED",
    "paymentStatus": "COMPLETED",
    "totalAmount": "50000",
    "createdAt": "2025-10-04T12:00:00Z",
    "updatedAt": "2025-10-04T12:30:00Z",
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "phone": "+2250700000000",
      "email": "john@example.com"
    },
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "PlayStation Plus 12 mois",
        "productType": "GIFT_CARD",
        "quantity": 1,
        "unitPrice": "25000",
        "totalPrice": "25000",
        "giftCardCodes": [
          {
            "id": "uuid",
            "code": "PSN1-XXXX-YYYY-ZZZZ",
            "status": "ACTIVE",
            "activationDate": "2025-10-04T12:30:00Z",
            "expiryDate": "2026-10-04T12:30:00Z"
          }
        ]
      }
    ]
  }
}
```

**Code Backend (Node.js/Express exemple)** :
```javascript
// routes/admin/orders.routes.js
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'phone', 'email']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'type']
            },
            {
              model: GiftCardCode,
              where: { status: { [Op.ne]: 'CANCELLED' } },
              required: false
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

---

#### ✅ PATCH /api/admin/orders/:orderId/status
**Déjà implémenté** (utilisé et fonctionne)

**Description** : Met à jour le statut de la commande

**Body** :
```json
{
  "status": "PROCESSING"
}
```

**Response** :
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-12345",
    "status": "PROCESSING",
    ...
  }
}
```

---

#### ❓ PATCH /api/admin/orders/:orderId/payment-status
**À VÉRIFIER / CRÉER**

**Description** : Met à jour le statut de paiement (pour paiements cash)

**URL** : `/api/admin/orders/:orderId/payment-status`

**Method** : `PATCH`

**Body** :
```json
{
  "paymentStatus": "COMPLETED"
}
```

**Response** :
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-12345",
    "paymentStatus": "COMPLETED",
    ...
  }
}
```

**Code Backend** :
```javascript
// routes/admin/orders.routes.js
router.patch('/:orderId/payment-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    // Validation
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment status'
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update payment status
    await order.update({ paymentStatus });

    // Recharger avec relations
    const updatedOrder = await Order.findByPk(orderId, {
      include: [/* includes */]
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

---

### 2. Gift Card Code Assignment

#### ⚠️ POST /api/admin/orders/:orderId/assign-codes
**PROBLÈME : Renvoie success: false en cas de succès**

**Description** : Attribution automatique des codes depuis l'inventory

**URL** : `/api/admin/orders/:orderId/assign-codes`

**Method** : `POST`

**Body** : aucun (vide)

**Response ACTUELLE (incorrecte)** :
```json
{
  "success": false,  // ⚠️ BUG: Devrait être true
  "message": "All codes assigned successfully",
  "data": {
    "results": [
      {
        "orderItemId": "uuid",
        "giftCard": "PlayStation Plus 12 mois",
        "status": "assigned",
        "codesCount": 1
      }
    ],
    "errors": []
  }
}
```

**Response ATTENDUE (correcte)** :
```json
{
  "success": true,  // ✅ Correct
  "message": "All codes assigned successfully",
  "data": {
    "results": [
      {
        "orderItemId": "uuid",
        "giftCard": "PlayStation Plus 12 mois",
        "status": "assigned",
        "codesCount": 1
      }
    ],
    "errors": []
  }
}
```

**Response en cas d'erreur partielle** :
```json
{
  "success": false,
  "message": "Some codes could not be assigned",
  "data": {
    "results": [
      {
        "orderItemId": "uuid1",
        "giftCard": "PlayStation Plus 12 mois",
        "status": "assigned",
        "codesCount": 1
      }
    ],
    "errors": [
      {
        "orderItemId": "uuid2",
        "giftCard": "Xbox Game Pass 3 mois",
        "needed": 2,
        "available": 0,
        "error": "Insufficient codes in inventory"
      }
    ]
  }
}
```

**FIX REQUIS dans le backend** :
```javascript
// routes/admin/orders.routes.js
router.post('/:orderId/assign-codes', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [/* includes */]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const results = [];
    const errors = [];

    // Pour chaque item gift card
    for (const item of order.items.filter(i => i.productType === 'GIFT_CARD')) {
      const needed = item.quantity - (item.giftCardCodes?.length || 0);

      if (needed === 0) continue;

      // Récupérer des codes disponibles de l'inventory
      const availableCodes = await GiftCardInventoryCode.findAll({
        where: {
          giftCardId: item.productId,
          status: 'AVAILABLE'
        },
        limit: needed
      });

      if (availableCodes.length < needed) {
        errors.push({
          orderItemId: item.id,
          giftCard: item.productName,
          needed,
          available: availableCodes.length,
          error: 'Insufficient codes in inventory'
        });
        continue;
      }

      // Assigner les codes
      for (const inventoryCode of availableCodes) {
        await GiftCardCode.create({
          orderItemId: item.id,
          code: inventoryCode.code,
          amount: item.unitPrice,
          status: 'ACTIVE',
          activationDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
        });

        // Marquer comme assigné dans l'inventory
        await inventoryCode.update({
          status: 'ASSIGNED',
          orderItemId: item.id,
          assignedAt: new Date()
        });
      }

      results.push({
        orderItemId: item.id,
        giftCard: item.productName,
        status: 'assigned',
        codesCount: availableCodes.length
      });
    }

    // ⚠️ FIX ICI : Renvoyer success: true si tout est assigné
    const success = errors.length === 0;

    res.status(success ? 200 : 207).json({  // 207 Multi-Status pour succès partiel
      success,  // ✅ true si aucune erreur, false sinon
      message: success
        ? 'All codes assigned successfully'
        : 'Some codes could not be assigned',
      data: { results, errors }
    });
  } catch (error) {
    console.error('Error assigning codes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

---

#### ❓ GET /api/admin/orders/:orderId/codes
**À VÉRIFIER / CRÉER**

**Description** : Récupère tous les codes assignés pour une commande

**Response** :
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "items": [
      {
        "orderItemId": "uuid",
        "productName": "PlayStation Plus 12 mois",
        "quantity": 1,
        "codes": [
          {
            "id": "uuid",
            "code": "PSN1-XXXX-YYYY-ZZZZ",
            "status": "ACTIVE",
            "activationDate": "2025-10-04T12:30:00Z"
          }
        ]
      }
    ]
  }
}
```

---

#### ✅ POST /api/admin/order-items/:orderItemId/assign-code
**Déjà implémenté** (fonctionne - 201 created)

**Description** : Assigner manuellement un code à un item

**Body** :
```json
{
  "code": "PSN1-ABCD-EFGH-IJKL"
}
```

**Response** :
```json
{
  "success": true,
  "data": {
    "code": "PSN1-ABCD-EFGH-IJKL",
    "status": "ACTIVE",
    "itemComplete": true,
    "remaining": 0,
    "totalRequired": 1,
    "totalAssigned": 1
  }
}
```

---

## 📊 Résumé des routes

| Route | Method | Status | Action requise |
|-------|--------|--------|----------------|
| `/admin/orders` | GET | ✅ OK | Aucune |
| `/admin/orders/:id` | GET | ❌ 404 | **À CRÉER** |
| `/admin/orders/:id/status` | PATCH | ✅ OK | Aucune |
| `/admin/orders/:id/payment-status` | PATCH | ❓ Inconnu | **À VÉRIFIER/CRÉER** |
| `/admin/orders/:id/assign-codes` | POST | ⚠️ Bug | **FIX: success: true** |
| `/admin/orders/:id/codes` | GET | ❓ Inconnu | **À VÉRIFIER** |
| `/admin/order-items/:id/assign-code` | POST | ✅ OK (201) | Aucune |

---

## 🔧 Actions prioritaires

### 1. **URGENT** : Créer GET /admin/orders/:orderId
Sans cette route, impossible de rafraîchir les détails d'une commande après une action.

### 2. **IMPORTANT** : Fixer POST /admin/orders/:orderId/assign-codes
Renvoie `success: false` même quand tout fonctionne → Confusing

### 3. **NÉCESSAIRE** : Créer/Vérifier PATCH /admin/orders/:orderId/payment-status
Pour marquer les paiements cash comme COMPLETED

### 4. **OPTIONNEL** : GET /admin/orders/:orderId/codes
Actuellement on utilise GET /admin/orders/:orderId qui inclut déjà les codes

---

## 📝 Code complet suggéré

Voici un fichier routes complet pour le backend :

```javascript
// routes/admin/orders.routes.js
const express = require('express');
const router = express.Router();
const { Order, OrderItem, User, Product, GiftCardCode, GiftCardInventoryCode } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/orders - Liste des commandes
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { '$user.fullName$': { [Op.like]: `%${search}%` } },
        { '$user.phone$': { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'phone']
        },
        {
          model: OrderItem,
          include: [{ model: Product }]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/orders/:orderId - Détails d'une commande
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'phone', 'email']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'type']
            },
            {
              model: GiftCardCode,
              where: { status: { [Op.ne]: 'CANCELLED' } },
              required: false
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/admin/orders/:orderId/status - Mettre à jour le statut
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    await order.update({ status });

    const updatedOrder = await Order.findByPk(orderId, {
      include: [/* includes */]
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/admin/orders/:orderId/payment-status - Mettre à jour le statut de paiement
router.patch('/:orderId/payment-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid payment status' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    await order.update({ paymentStatus });

    const updatedOrder = await Order.findByPk(orderId, {
      include: [/* includes */]
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/admin/orders/:orderId/assign-codes - Attribution automatique
router.post('/:orderId/assign-codes', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [
            { model: Product },
            { model: GiftCardCode }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const results = [];
    const errors = [];

    for (const item of order.items.filter(i => i.product.type === 'GIFT_CARD')) {
      const needed = item.quantity - (item.giftCardCodes?.length || 0);

      if (needed === 0) continue;

      const availableCodes = await GiftCardInventoryCode.findAll({
        where: {
          giftCardId: item.productId,
          status: 'AVAILABLE'
        },
        limit: needed
      });

      if (availableCodes.length < needed) {
        errors.push({
          orderItemId: item.id,
          giftCard: item.product.name,
          needed,
          available: availableCodes.length,
          error: 'Insufficient codes in inventory'
        });
        continue;
      }

      for (const inventoryCode of availableCodes) {
        await GiftCardCode.create({
          orderItemId: item.id,
          code: inventoryCode.code,
          amount: item.unitPrice,
          status: 'ACTIVE',
          activationDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });

        await inventoryCode.update({
          status: 'ASSIGNED',
          orderItemId: item.id,
          assignedAt: new Date()
        });
      }

      results.push({
        orderItemId: item.id,
        giftCard: item.product.name,
        status: 'assigned',
        codesCount: availableCodes.length
      });
    }

    const success = errors.length === 0;

    res.status(success ? 200 : 207).json({
      success,  // ✅ Fixé ici
      message: success
        ? 'All codes assigned successfully'
        : 'Some codes could not be assigned',
      data: { results, errors }
    });
  } catch (error) {
    console.error('Error assigning codes:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
```

---

## ✅ Checklist pour le backend

- [ ] Créer `GET /api/admin/orders/:orderId`
- [ ] Créer ou vérifier `PATCH /api/admin/orders/:orderId/payment-status`
- [ ] Fixer `POST /api/admin/orders/:orderId/assign-codes` pour renvoyer `success: true`
- [ ] Tester toutes les routes avec Postman/Thunder Client
- [ ] Vérifier que les relations Sequelize incluent bien les gift card codes
- [ ] S'assurer que les codes sont assignés correctement dans l'inventory

---

Voulez-vous que je vous aide à implémenter ces routes dans le backend ?
