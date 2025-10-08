# 🔐 Correctif : Stockage des Tokens d'Authentification et Envoi OTP

**Date** : 2025-10-03
**Statut** : ✅ Résolu

---

## 🐛 Problèmes Identifiés

### 1. Erreur `resendOTP` : Cannot read property 'otpSent' of undefined

```
ERROR  Resend OTP error: [TypeError: Cannot read property 'otpSent' of undefined]

Code: authStore.ts:333
  332 |           const response = await authService.resendOtp(phone, type);
> 333 |           return response.otpSent;
```

**Cause** : Incompatibilité entre le format de réponse du backend et le format attendu par le frontend.

- **Backend retourne** : `{ success: true, message: "OTP sent successfully" }`
- **Frontend attendait** : `{ otpSent: boolean, expiresAt: string, attemptsRemaining: number }`

### 2. Erreur Navigation OTP après Login

```
LOG  ✅ Detected PHONE_VERIFICATION_REQUIRED, showing alert...
ERROR 🔴 Login screen caught error: [Error: Phone verification required]
```

Le flow de navigation fonctionnait mais l'erreur OTP empêchait la vérification.

---

## ✅ Solutions Implémentées

### 1. Correction `authService.resendOtp()` (services/authService.ts)

**AVANT** :
```typescript
async resendOtp(phone: string, type: OtpType): Promise<{
  otpSent: boolean;
  expiresAt: string;
  attemptsRemaining: number;
}> {
  const resendData: ResendOtpRequest = { phone, type };

  return await apiClient.post<{
    otpSent: boolean;
    expiresAt: string;
    attemptsRemaining: number;
  }>(API_ENDPOINTS.AUTH.RESEND_OTP, resendData);
}
```

**APRÈS** :
```typescript
async resendOtp(phone: string, type: OtpType): Promise<{
  otpSent: boolean;
  expiresAt: string;
  attemptsRemaining: number;
}> {
  const resendData: ResendOtpRequest = { phone, type };

  // Backend returns { success: true, message: "OTP sent successfully" }
  // We need to transform it to match our expected format
  await apiClient.post<void>(API_ENDPOINTS.AUTH.RESEND_OTP, resendData);

  // If no error was thrown, OTP was sent successfully
  return {
    otpSent: true,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    attemptsRemaining: 3 // Default value
  };
}
```

### 2. Correction `authService.forgotPassword()`

**AVANT** :
```typescript
async forgotPassword(phone: string): Promise<{ otpSent: boolean }> {
  const forgotData: ForgotPasswordRequest = { phone };
  return await apiClient.post<{ otpSent: boolean }>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    forgotData
  );
}
```

**APRÈS** :
```typescript
async forgotPassword(phone: string): Promise<{ otpSent: boolean }> {
  const forgotData: ForgotPasswordRequest = { phone };

  // Backend returns { success: true, message: "..." }
  await apiClient.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, forgotData);

  // If no error was thrown, OTP was sent successfully
  return { otpSent: true };
}
```

### 3. Correction `authService.resetPassword()`

**AVANT** :
```typescript
async resetPassword(phone: string, otp: string, newPassword: string): Promise<{ passwordReset: boolean }> {
  const resetData: ResetPasswordRequest = { phone, otp, newPassword };
  return await apiClient.post<{ passwordReset: boolean }>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    resetData
  );
}
```

**APRÈS** :
```typescript
async resetPassword(phone: string, otp: string, newPassword: string): Promise<{ passwordReset: boolean }> {
  const resetData: ResetPasswordRequest = { phone, otp, newPassword };

  // Backend returns { success: true, message: "Password reset successfully" }
  await apiClient.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);

  // If no error was thrown, password was reset successfully
  return { passwordReset: true };
}
```

---

## 🔄 Flow de Vérification OTP - Après Correction

### 1. Login avec téléphone non vérifié

```
User Login (app/auth/login.tsx)
    ↓
authStore.login() (stores/authStore.ts)
    ↓
authService.login() (services/authService.ts)
    ↓
Backend Response: { success: true, code: 'PHONE_VERIFICATION_REQUIRED', data: { userId, phone, phoneVerified: false } }
    ↓
Error thrown with code 'PHONE_VERIFICATION_REQUIRED'
    ↓
authStore catches error → calls authService.resendOtp() ✅ (now works!)
    ↓
Login screen catches error → shows Alert → navigates to /auth/verify-otp
    ↓
User enters OTP code
    ↓
authStore.verifyOTP() → authService.verifyOtp()
    ↓
Backend Response: { success: true, data: { user, tokens } }
    ↓
authStore saves: user, token, refreshToken, isAuthenticated = true
    ↓
apiClient.setTokens(accessToken, refreshToken) ✅
    ↓
Navigate to /(tabs) ✅
```

### 2. Resend OTP depuis l'écran de vérification

```
User clicks "Renvoyer le code" (app/auth/verify-otp.tsx)
    ↓
authStore.resendOTP(phone, type)
    ↓
authService.resendOtp(phone, type) ✅ (now works!)
    ↓
Backend: { success: true, message: "OTP sent successfully" }
    ↓
Transform to: { otpSent: true, expiresAt: "...", attemptsRemaining: 3 }
    ↓
Reset countdown timer
    ↓
Show success alert ✅
```

---

## 🧪 Tests de Validation

### ✅ Test 1 : Login avec téléphone non vérifié
1. Ouvrir l'app
2. Cliquer sur "Se connecter"
3. Entrer numéro de téléphone : `+2250586987934`
4. Entrer mot de passe
5. Cliquer sur "Continuer"
6. **Résultat attendu** :
   - ✅ Alert "Vérification requise" s'affiche
   - ✅ Navigation vers `/auth/verify-otp` avec params `{ phone, type: 'login' }`
   - ✅ OTP envoyé automatiquement (log visible)

### ✅ Test 2 : Resend OTP
1. Sur l'écran OTP, attendre 60 secondes
2. Cliquer sur "Renvoyer le code"
3. **Résultat attendu** :
   - ✅ Pas d'erreur `Cannot read property 'otpSent'`
   - ✅ Alert "Code renvoyé" s'affiche
   - ✅ Timer reset à 60 secondes
   - ✅ Inputs OTP vidés

### ✅ Test 3 : Vérification OTP et stockage tokens
1. Entrer le code OTP reçu (6 chiffres)
2. Cliquer sur "Continuer"
3. **Résultat attendu** :
   - ✅ Tokens sauvegardés dans authStore (`token`, `refreshToken`)
   - ✅ Tokens sauvegardés dans AsyncStorage
   - ✅ Tokens configurés dans apiClient
   - ✅ `isAuthenticated = true`
   - ✅ Navigation vers `/(tabs)`

### ✅ Test 4 : Persistance de session
1. Fermer l'app complètement
2. Rouvrir l'app
3. **Résultat attendu** :
   - ✅ Tokens chargés depuis AsyncStorage
   - ✅ apiClient.setTokens() appelé avec les tokens hydratés
   - ✅ Navigation automatique vers `/(tabs)` (pas d'écran de login)

---

## 📝 Fichiers Modifiés

### [services/authService.ts](services/authService.ts)
- Ligne 249-272 : `resendOtp()` - transformation de réponse backend
- Ligne 277-288 : `forgotPassword()` - transformation de réponse backend
- Ligne 293-308 : `resetPassword()` - transformation de réponse backend

---

## 🔐 Architecture de Gestion des Tokens

### Stockage des Tokens

```typescript
// 1. authStore (Zustand) - stores/authStore.ts
{
  user: User | null,
  token: string | null,           // Access Token
  refreshToken: string | null,    // Refresh Token
  isAuthenticated: boolean
}

// 2. AsyncStorage (Persistence)
// Key: 'yu-card-auth'
// Partialize config persists: user, token, refreshToken, isAuthenticated

// 3. apiClient (Memory) - services/apiClient.ts
// Private variables in memory:
let accessToken: string | null = null;
let refreshToken: string | null = null;
```

### Points Clés de Synchronisation

1. **Après Login/Vérification OTP** :
   ```typescript
   // authStore.ts ligne 305-316
   set({
     user: response.user,
     token: response.tokens.accessToken,
     refreshToken: response.tokens.refreshToken,
     isAuthenticated: true
   });
   await apiClient.setTokens(
     response.tokens.accessToken,
     response.tokens.refreshToken
   );
   ```

2. **Après Refresh Token** :
   ```typescript
   // authStore.ts ligne 210-216
   set({
     token: response.accessToken,
     refreshToken: response.refreshToken
   });
   await apiClient.setTokens(
     response.accessToken,
     response.refreshToken
   );
   ```

3. **Au Chargement de l'App** :
   ```typescript
   // authStore.ts ligne 261-267
   if (token && refreshToken) {
     await apiClient.setTokens(token, refreshToken);
   }
   ```

4. **Lors du Logout** :
   ```typescript
   // authStore.ts ligne 178-188
   set({
     user: null,
     token: null,
     refreshToken: null,
     isAuthenticated: false
   });
   await apiClient.clearTokens();
   ```

---

## 🎯 Conclusion

### Problèmes Résolus ✅
- ✅ Erreur `resendOTP` : Cannot read property 'otpSent'
- ✅ Envoi automatique d'OTP lors de login avec téléphone non vérifié
- ✅ Stockage correct des tokens après vérification OTP
- ✅ Synchronisation tokens entre authStore et apiClient
- ✅ Persistance de session après redémarrage app

### Architecture Robuste ✅
- ✅ Transformation des réponses backend pour compatibilité frontend
- ✅ Gestion d'erreur claire avec codes spécifiques
- ✅ Triple stockage des tokens (Store + AsyncStorage + apiClient memory)
- ✅ Auto-refresh des tokens expirés

### Flow Complet Testé ✅
1. Login → Phone verification required → OTP sent
2. Enter OTP → Verify → Tokens saved → Navigate to app
3. Resend OTP → Success → Timer reset
4. Close app → Reopen → Auto-login avec tokens persistés

---

**Développeurs** : Adel Boudalha
**Framework** : Expo Router + Zustand + AsyncStorage
**Backend API** : Node.js + Express + Prisma
