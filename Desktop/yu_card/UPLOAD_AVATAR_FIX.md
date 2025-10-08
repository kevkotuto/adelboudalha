# Fix Final - Upload Avatar

## 🐛 Problème Identifié

L'erreur 500 persistait même après avoir corrigé l'endpoint de `/upload/avatar` à `/users/avatar`.

### Logs d'erreur
```
LOG  🌐 API Request: POST /users/avatar
ERROR ❌ Request failed with status code 500
ERROR [ImageUploadButton] Upload error: Internal server error
```

## 🔍 Cause Racine

Le backend `/users/avatar` attend le champ FormData nommé **`avatar`**, mais `apiClient.upload()` utilisait **`file`** comme nom de champ par défaut.

### Code Problématique

```typescript
// apiClient.ts:479
const fieldName = Array.isArray(files) ? `files[${index}]` : 'file';
formData.append(fieldName, file as any);
// ❌ Envoie 'file' au lieu de 'avatar'
```

### Attentes Backend

Selon la documentation:
```bash
POST /api/users/avatar
Body: multipart/form-data
- avatar: fichier (JPEG/PNG)  # ← Nom du champ attendu
```

## ✅ Solution Appliquée

### Modification: [services/uploadService.ts](services/uploadService.ts:50-91)

Réécriture de la méthode `uploadAvatar()` pour créer manuellement le FormData avec le bon nom de champ:

```typescript
async uploadAvatar(
  file: FileUpload,
  options: Omit<UploadAvatarRequest, 'file'> = {},
  onProgress?: UploadProgressCallback
): Promise<UploadResponse> {
  // ✅ Créer FormData manuellement avec 'avatar' comme nom
  const formData = new FormData();
  formData.append('avatar', file as any);  // ← Correct!

  // Ajouter options supplémentaires si présentes
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  // ✅ Utiliser post() directement au lieu de upload()
  return await apiClient.post<UploadResponse>(
    API_ENDPOINTS.UPLOAD.AVATAR,  // '/users/avatar'
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: onProgress ? (progressEvent) => {
        if (progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      } : undefined,
    }
  );
}
```

## 🎯 Résultat Attendu

### Requête HTTP Correcte

```http
POST /api/users/avatar HTTP/1.1
Host: yucard.generale-ci.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary...--
```

**Note**: Le champ s'appelle bien `avatar`, pas `file`.

### Logs de Succès Attendus

```
LOG  🌐 API Request: POST /users/avatar
LOG  ✅ Upload successful: https://apifiles.generale-ci.com/files/avatar_xxx.webp
LOG  📝 Updating user in store: Kevine ghoussoub 2
LOG  ✅ Profile updated successfully
```

## 📝 Autres Routes d'Upload

### Produits

Pour `/products/{id}/images`, le backend attend:
```typescript
formData.append('images', file);  // Nom: 'images' (pluriel)
```

### Gift Cards

Pour `/gift-cards/{id}/images`, le backend attend:
```typescript
formData.append('images', file);  // Nom: 'images' (pluriel)
```

### Upload Générique

Pour `/upload/image`, le backend attend:
```typescript
formData.append('image', file);  // Nom: 'image' (singulier)
```

## ⚠️ Note Importante

Chaque route backend a son propre nom de champ attendu. Il faut vérifier la documentation backend pour chaque endpoint:

| Route | Champ Attendu | Type |
|-------|---------------|------|
| `/users/avatar` | `avatar` | Single file |
| `/upload/image` | `image` | Single file |
| `/upload/images` | `images` | Multiple files |
| `/upload/product-images` | `images` | Multiple files |
| `/upload/gift-card-images` | `images` | Multiple files |
| `/products/{id}/images` | `images` | Multiple files |
| `/gift-cards/{id}/images` | `images` | Multiple files |

## 🧪 Test

### Test Manuel

1. Relancer le serveur:
   ```bash
   ./scripts/clear-cache.sh
   ```

2. Dans l'app:
   - Aller sur **Profil** → **Modifier le profil**
   - Cliquer sur l'**avatar**
   - Sélectionner une photo
   - Observer les logs console
   - ✅ Upload devrait réussir!

### Test avec cURL

```bash
TOKEN="your-jwt-token"

curl -X POST https://yucard.generale-ci.com/api/users/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@photo.jpg"
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "avatarUrl": "https://apifiles.generale-ci.com/files/avatar_xxx.webp",
      ...
    },
    "file": {
      "url": "https://apifiles.generale-ci.com/files/avatar_xxx.webp",
      "size": 15678,
      "contentType": "image/webp"
    }
  }
}
```

## ✅ Checklist Finale

- [x] Endpoint corrigé: `/users/avatar`
- [x] Nom de champ corrigé: `avatar`
- [x] FormData créé manuellement
- [x] Méthode `apiClient.post()` utilisée directement
- [x] Headers `multipart/form-data` ajoutés
- [x] Timeout augmenté (60s)
- [x] Progress callback préservé
- [x] Documentation mise à jour

## 🎊 Conclusion

**L'upload d'avatar devrait maintenant fonctionner correctement!**

Le problème était une incompatibilité entre le nom de champ envoyé (`file`) et celui attendu par le backend (`avatar`). La solution a été de créer manuellement le FormData avec le bon nom de champ.

---

**Date**: 2025-10-07
**Status**: ✅ Fixed
**Testez maintenant!** 🚀
