# Intégration SMS OTP Auto-Détection

## 📱 Technologie Utilisée

**Package**: `expo-sms-retriever` v1.0.0
- Utilise l'API SMS Retriever de Google
- **AUCUNE permission SMS requise** ✅
- Fonctionne uniquement sur Android
- Timeout automatique après 5 minutes

## 🔧 Implémentation Client (React Native)

### Installation
```bash
npm install expo-sms-retriever
```

### Fonctionnalités
1. **Détection automatique** du SMS OTP
2. **Auto-remplissage** des champs OTP
3. **Hash de l'application** pour identifier l'app
4. **Écoute SMS** pendant 5 minutes max

## 🔑 Configuration Backend

### Format du SMS OBLIGATOIRE

Le SMS doit suivre ce format exact pour que la détection automatique fonctionne :

```
<#> Votre code Yu Card est: 123456

[APP_HASH]
```

**Exemple concret** :
```
<#> Votre code Yu Card est: 123456

FA+9qCX9VSu
```

### Éléments Critiques

1. **Préfixe `<#>`** : Obligatoire au début du message
2. **Code OTP** : Doit être un nombre à 6 chiffres
3. **Saut de ligne** : Une ligne vide avant le hash
4. **Hash de l'app** : Code unique de 11 caractères généré par l'app

### Comment Obtenir le Hash

Le hash est généré automatiquement par l'application. Pour le récupérer :

1. **En développement** : Vérifier les logs console
   ```
   Console log: "App Hash for SMS: FA+9qCX9VSu"
   ```

2. **En production** : Le hash est stable pour chaque version de l'app
   - Récupérer le hash une fois lors du premier lancement
   - Le stocker côté backend pour l'utiliser dans tous les SMS

### API Backend - Exemple d'Envoi SMS

```javascript
// Exemple Node.js
async function sendOTP(phone, otpCode, appHash) {
  const message = `<#> Votre code Yu Card est: ${otpCode}

${appHash}`;

  // Envoyer le SMS via votre provider (Twilio, AWS SNS, etc.)
  await smsProvider.send({
    to: phone,
    message: message
  });
}
```

```python
# Exemple Python
def send_otp(phone: str, otp_code: str, app_hash: str):
    message = f"""<#> Votre code Yu Card est: {otp_code}

{app_hash}"""

    # Envoyer le SMS via votre provider
    sms_provider.send(
        to=phone,
        message=message
    )
```

## 🧪 Tests

### En Développement (Expo Go)
- Hash par défaut: `"NOHASH"`
- OTP par défaut: `"123456"`
- Utilise un module mock

### En Production (Standalone/EAS Build)
- Hash réel généré par l'app
- Vérifier que le backend utilise le bon hash

## 📋 Checklist Backend

- [ ] Le SMS commence par `<#>`
- [ ] Le code OTP est présent dans le message
- [ ] Il y a un saut de ligne vide avant le hash
- [ ] Le hash de l'app (11 caractères) est à la fin
- [ ] Le message ne dépasse pas 140 caractères

## ⚠️ Notes Importantes

1. **Android uniquement** : iOS ne supporte pas cette API
2. **Pas de permissions** : Aucune permission SMS n'est requise
3. **Timeout 5 minutes** : Le listener s'arrête automatiquement après 5 minutes
4. **Format strict** : Le format du SMS doit être respecté exactement

## 🔍 Debugging

### Si l'auto-détection ne fonctionne pas :

1. Vérifier les logs pour voir le hash généré
2. S'assurer que le SMS respecte le format exact
3. Vérifier que le hash dans le SMS correspond au hash de l'app
4. Tester avec un build standalone (pas Expo Go en production)

### Logs à vérifier :
```
✅ "App Hash for SMS: FA+9qCX9VSu"
✅ "SMS Retriever started successfully"
✅ "SMS received: { message: '...', otp: '123456' }"
```

## 📚 Ressources

- [expo-sms-retriever GitHub](https://github.com/s0ubhik/expo-sms-retriever)
- [Google SMS Retriever API](https://developers.google.com/identity/sms-retriever/overview)
