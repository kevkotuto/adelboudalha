# 📤 Documentation API Upload - Yu Card Backend


## 🔐 Authentification
Toutes les routes (sauf `/config` et `/health`) nécessitent un token JWT dans le header :
```http
Authorization: Bearer <votre-token-jwt>
```

---

## 📸 Routes d'Upload d'Images

### 1️⃣ Upload d'Images de Produits
**Endpoint:** `POST /api/upload/product-images`

**Description:** Upload optimisé pour les images de produits avec traitement automatique (resize 800x800, conversion WebP, compression 85%).

**Authentification:** ✅ Requise

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
images: File[] (max 10 fichiers)
```

**Types acceptés:** JPG, JPEG, PNG, WebP
**Taille max par fichier:** 5 MB
**Format de sortie:** WebP 800x800px, qualité 85%

**Exemple cURL:**
```bash
curl -X POST http://localhost:30010/api/upload/product-images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@product1.jpg" \
  -F "images=@product2.png"
```

**Exemple JavaScript/TypeScript:**
```typescript
const formData = new FormData();
formData.append('images', file1); // File object
formData.append('images', file2);

const response = await fetch('http://localhost:30010/api/upload/product-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "2 product images uploaded successfully",
  "data": {
    "images": [
      {
        "id": "a17af523-789c-4067-bde1-008ce6a6060e",
        "key": "icon_1759638337267_73p8zk.webp",
        "url": "http://apifiles.generale-ci.com/api/download/a17af523-789c-4067-bde1-008ce6a6060e",
        "downloadUrl": "http://apifiles.generale-ci.com/api/download/a17af523-789c-4067-bde1-008ce6a6060e",
        "size": 21298,
        "contentType": "image/webp",
        "originalName": "icon.webp",
        "filename": "icon_1759638337267_73p8zk.webp",
        "path": "uploads/image/icon_1759638337267_73p8zk.webp",
        "checksum": "c0343b42fe4cf75a025ecdf08cc0a00a",
        "uploadDate": "2025-10-05T04:25:37.292Z",
        "isPublic": true,
        "tags": ["product", "image", "products"],
        "thumbnailPath": "uploads/thumbnails/icon_1759638337267_73p8zk_thumb.jpg",
        "downloadCount": 0
      }
    ],
    "count": 2,
    "uploadedBy": "user-uuid",
    "uploadedAt": "2025-10-05T04:25:37.873Z"
  }
}
```

---

### 2️⃣ Upload d'Images de Cartes Cadeaux
**Endpoint:** `POST /api/upload/gift-card-images`

**Description:** Upload optimisé pour les images de gift cards (resize 600x400, conversion WebP, compression 80%).

**Authentification:** ✅ Requise

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
images: File[] (max 5 fichiers)
```

**Types acceptés:** JPG, JPEG, PNG, WebP
**Taille max par fichier:** 5 MB
**Format de sortie:** WebP 600x400px, qualité 80%

**Exemple React/Next.js:**
```typescript
const handleGiftCardUpload = async (files: FileList) => {
  const formData = new FormData();

  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await fetch('http://localhost:30010/api/upload/gift-card-images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Utilise data.data.images[0].url pour afficher l'image
      console.log('Images uploadées:', data.data.images.map(img => img.url));
    }
  } catch (error) {
    console.error('Erreur upload:', error);
  }
};
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "1 gift card images uploaded successfully",
  "data": {
    "images": [
      {
        "id": "d918f2e4-7e83-4597-8f73-e3f24c36c593",
        "url": "http://apifiles.generale-ci.com/api/download/d918f2e4-7e83-4597-8f73-e3f24c36c593",
        "size": 15150,
        "contentType": "image/webp",
        "isPublic": true,
        "tags": ["gift-card", "image", "gift-cards"]
      }
    ],
    "count": 1,
    "uploadedBy": "user-uuid",
    "uploadedAt": "2025-10-05T04:27:26.413Z"
  }
}
```

---

### 3️⃣ Upload d'Avatar Utilisateur
**Endpoint:** `POST /api/upload/avatar`

**Description:** Upload d'avatar avec traitement optimisé (resize 200x200, conversion WebP, compression 85%).

**Authentification:** ✅ Requise

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
avatar: File (1 seul fichier)
```

**Types acceptés:** JPG, JPEG, PNG
**Taille max:** 2 MB
**Format de sortie:** WebP 200x200px (carré), qualité 85%

**Exemple avec Axios:**
```typescript
import axios from 'axios';

const uploadAvatar = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await axios.post(
    'http://localhost:30010/api/upload/avatar',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return data.data.avatar.url; // URL de l'avatar uploadé
};
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": {
      "id": "72c66d40-b4a6-4766-9605-9e330c85fe0a",
      "url": "http://apifiles.generale-ci.com/api/download/72c66d40-b4a6-4766-9605-9e330c85fe0a",
      "size": 4390,
      "contentType": "image/webp",
      "isPublic": false,
      "tags": ["avatar", "profile", "avatars"]
    },
    "uploadedBy": "user-uuid",
    "uploadedAt": "2025-10-05T04:26:16.591Z"
  }
}
```

⚠️ **Note:** Les avatars sont **privés** (`isPublic: false`) et nécessitent une authentification pour être téléchargés.

---

### 4️⃣ Upload d'une Image Simple
**Endpoint:** `POST /api/upload/image`

**Description:** Upload d'une seule image sans traitement spécifique.

**Authentification:** ✅ Requise

**Body (Form Data):**
```
image: File (1 seul fichier)
```

**Types acceptés:** JPG, JPEG, PNG, WebP, GIF
**Taille max:** 10 MB

---

### 5️⃣ Upload d'Images Multiples
**Endpoint:** `POST /api/upload/images`

**Description:** Upload de plusieurs images (usage général).

**Authentification:** ✅ Requise

**Body (Form Data):**
```
images: File[] (max 5 fichiers)
```

**Types acceptés:** JPG, JPEG, PNG, WebP, GIF
**Taille max par fichier:** 10 MB

---

## 📄 Routes de Documents

### 6️⃣ Upload de Document
**Endpoint:** `POST /api/upload/document`

**Description:** Upload de documents (PDF, Word, etc.).

**Authentification:** ✅ Requise

**Body (Form Data):**
```
document: File (1 seul fichier)
```

**Types acceptés:** PDF, DOC, DOCX, TXT, RTF
**Taille max:** 10 MB

**Exemple:**
```typescript
const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch('http://localhost:30010/api/upload/document', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

---

## 🔧 Routes Utilitaires

### 7️⃣ Configuration de l'Upload
**Endpoint:** `GET /api/upload/config`

**Description:** Récupère les limites et configurations d'upload.

**Authentification:** ❌ Non requise

**Exemple:**
```bash
curl http://localhost:30010/api/upload/config
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "data": {
    "maxFileSize": 10485760,
    "maxFilesPerUpload": 5,
    "allowedImageTypes": ["jpg", "jpeg", "png", "webp"],
    "allowedDocumentTypes": ["pdf", "doc", "docx", "txt", "rtf"],
    "imageProcessing": {
      "thumbnailSize": 200,
      "mediumSize": 600,
      "largeSize": 800,
      "defaultQuality": 85,
      "defaultFormat": "webp"
    }
  }
}
```

---

### 8️⃣ Validation de Fichier (Avant Upload)
**Endpoint:** `POST /api/upload/validate`

**Description:** Valide un fichier sans l'uploader (test de taille, type, etc.).

**Authentification:** ❌ Non requise

**Body (Form Data):**
```
file: File
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "File validation passed",
  "data": {
    "valid": true,
    "errors": [],
    "fileInfo": {
      "name": "image.jpg",
      "size": 1024000,
      "type": "image/jpeg"
    }
  }
}
```

---

### 9️⃣ Suppression de Fichier
**Endpoint:** `DELETE /api/upload/file/:filename`

**Description:** Supprime un fichier uploadé.

**Authentification:** ✅ Requise

**Paramètres:**
- `filename` (path): Nom du fichier à supprimer
- `type` (query, optionnel): Type de dossier (`temp`, `products`, `gift-cards`, `avatars`, `documents`)

**Exemple:**
```bash
curl -X DELETE "http://localhost:30010/api/upload/file/image_123.webp?type=products" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 🔟 Health Check
**Endpoint:** `GET /api/upload/health`

**Description:** Vérifie l'état du service d'upload.

**Authentification:** ❌ Non requise

**Réponse (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uploadDirectory": "./uploads",
    "totalFiles": 150,
    "totalSize": 52428800,
    "directories": ["products", "gift-cards", "avatars", "documents", "temp"],
    "timestamp": "2025-10-05T04:30:00.000Z"
  }
}
```

---

## 🔐 Routes Admin

### 1️⃣1️⃣ Informations de Stockage
**Endpoint:** `GET /api/upload/storage-info`

**Description:** Récupère les statistiques de stockage (admin seulement).

**Authentification:** ✅ Requise (Admin)

**Réponse (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSize": 104857600,
    "totalSizeFormatted": "100 MB",
    "fileCount": 250,
    "directorySizes": {
      "products": {
        "size": 52428800,
        "sizeFormatted": "50 MB",
        "count": 120
      },
      "gift-cards": {
        "size": 31457280,
        "sizeFormatted": "30 MB",
        "count": 80
      }
    }
  }
}
```

---

### 1️⃣2️⃣ Nettoyage des Fichiers Temporaires
**Endpoint:** `POST /api/upload/cleanup-temp`

**Description:** Supprime les fichiers temporaires anciens (admin seulement).

**Authentification:** ✅ Requise (Admin)

**Paramètres Query:**
- `maxAge` (optionnel): Âge maximum en heures (défaut: 24)

**Exemple:**
```bash
curl -X POST "http://localhost:30010/api/upload/cleanup-temp?maxAge=48" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📥 Accès aux Images Uploadées

### Images Publiques (Produits & Gift Cards)
Les URLs retournées sont **directement accessibles** sans authentification :

```typescript
// Exemple d'affichage d'image de produit
<img
  src="http://apifiles.generale-ci.com/api/download/a17af523-789c-4067-bde1-008ce6a6060e"
  alt="Product"
/>
```

### Images Privées (Avatars)
Nécessitent un header `Authorization: Bearer <token>` pour être téléchargées.

---

## 🎨 Traitement Automatique des Images

### Configuration par Type:

| Type | Dimensions | Format | Qualité | Publique |
|------|-----------|--------|---------|----------|
| **Produits** | 800x800px | WebP | 85% | ✅ Oui |
| **Gift Cards** | 600x400px | WebP | 80% | ✅ Oui |
| **Avatars** | 200x200px (carré) | WebP | 85% | ❌ Non |
| **Images générales** | Original | Original | 100% | ❌ Non |

---

## ⚠️ Gestion des Erreurs

### Codes d'Erreur Courants:

| Code | Description |
|------|-------------|
| `400` | Fichier invalide ou manquant |
| `401` | Token JWT manquant ou invalide |
| `403` | Permissions insuffisantes (admin requis) |
| `404` | Fichier non trouvé |
| `413` | Fichier trop volumineux |
| `415` | Type de fichier non supporté |
| `500` | Erreur serveur |

### Format de Réponse d'Erreur:
```json
{
  "success": false,
  "message": "Product images upload failed",
  "error": "File size exceeds maximum allowed size"
}
```

---

## 🚀 Exemple Complet React/Next.js

```typescript
import { useState } from 'react';

export default function ProductImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:30010/api/upload/product-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const urls = data.data.images.map((img: any) => img.url);
        setUploadedImages(urls);
        alert(`${data.data.count} images uploadées avec succès!`);
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload d'Images de Produits</h2>

      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
      />

      {uploading && <p>Upload en cours...</p>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {uploadedImages.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Product ${index + 1}`}
            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 📌 Points Importants

1. **Compression Automatique**: Toutes les images de produits/gift-cards sont automatiquement converties en WebP avec compression
2. **Réduction de Taille**: Réduction moyenne de 90-95% de la taille des fichiers
3. **URLs Publiques**: Les images de produits/gift-cards sont directement accessibles sans authentification
4. **Stockage Cloud**: Les fichiers sont stockés sur le service Kev Storage (10 GB disponibles)
5. **Miniatures**: Des thumbnails sont automatiquement générés pour toutes les images
6. **Limite de Fichiers**:
   - Produits: 10 fichiers max
   - Gift Cards: 5 fichiers max
   - Avatars: 1 fichier
   - Images générales: 5 fichiers max

---

## 🔗 Liens Utiles

- **API Swagger**: http://localhost:30010/api-docs
- **Health Check**: http://localhost:30010/api/upload/health
- **Configuration**: http://localhost:30010/api/upload/config

---

## 📞 Support

Pour toute question ou problème, vérifiez :
1. Que le token JWT est valide
2. Que la taille du fichier ne dépasse pas les limites
3. Que le type de fichier est supporté
4. Les logs du serveur avec `pm2 logs yu-card-api`

**Exemple d'URL d'image de test:**
http://apifiles.generale-ci.com/api/download/e83b4028-1e6a-44e0-be13-c3cfaba19488
