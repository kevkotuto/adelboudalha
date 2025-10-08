export const mapErrorToTranslationKey = (errorMessage: string): string => {
  // Normalize the error message by removing extra spaces and converting to lowercase
  const normalizedError = errorMessage.trim().toLowerCase();

  // Mapping for French error messages from backend
  const errorMappings: Record<string, string> = {
    // Required field errors
    "le numéro de téléphone est requis.": "auth_errors.phone_required",
    "le mot de passe est requis.": "auth_errors.password_required",
    "le nom complet est requis.": "auth_errors.fullname_required",

    // Format validation errors
    "le format du numéro de téléphone est invalide.": "auth_errors.phone_format_invalid",
    "le mot de passe doit contenir au moins 6 caractères.": "auth_errors.password_too_short",

    // Duplicate phone errors
    "un compte avec ce numéro de téléphone existe déjà.": "auth_errors.phone_already_exists",

    // Authentication errors
    "aucun compte trouvé avec ce numéro de téléphone.": "auth_errors.no_account_found",
    "mot de passe incorrect.": "auth_errors.incorrect_password",
    "Mot de passe incorrect.": "auth_errors.incorrect_password", // Handle capitalized version

    // Server errors
    "erreur interne du serveur lors de l'inscription.": "auth_errors.server_error_register",
    "erreur interne du serveur lors de la connexion.": "auth_errors.server_error_login",
    "erreur serveur": "auth_errors.server_error_logout",
    "erreur interne du serveur.": "auth_errors.server_error_general",

    // SMS service errors
    "service sms temporairement indisponible. veuillez réessayer plus tard.": "auth_errors.sms_service_unavailable",
    
    // Reset password errors
    "le token de réinitialisation est requis.": "auth_errors.reset_token_required",
    "le nouveau mot de passe est requis.": "auth_errors.new_password_required",
    "le nouveau mot de passe doit contenir au moins 6 caractères.": "auth_errors.new_password_too_short",
    "token de réinitialisation invalide ou inexistant.": "auth_errors.invalid_reset_token",
    "le token de réinitialisation a expiré. veuillez demander un nouveau lien.": "auth_errors.reset_token_expired",
    "le code de réinitialisation est requis.": "auth_errors.reset_code_required",
    "aucun code de réinitialisation en attente pour ce compte.": "auth_errors.no_reset_code",
    "le code de réinitialisation a expiré. veuillez demander un nouveau code.": "auth_errors.reset_code_expired",
    "le code de réinitialisation est incorrect.": "auth_errors.incorrect_reset_code",
    
    // Change password errors
    "l'ancien mot de passe est requis.": "auth_errors.old_password_required",
    "l'ancien mot de passe est incorrect.": "auth_errors.old_password_incorrect",
    "le nouveau mot de passe doit être différent de l'ancien.": "auth_errors.same_password",
    "utilisateur introuvable.": "auth_errors.user_not_found",
    
    // Validation errors that may come with prefix
    "données invalides": "auth_errors.invalid_data"
  };

  // Look for exact match first
  if (errorMappings[normalizedError]) {
    return errorMappings[normalizedError];
  }

  // Look for partial matches for composite error messages
  for (const [key, value] of Object.entries(errorMappings)) {
    if (normalizedError.includes(key)) {
      return value;
    }
  }

  // Default error handling - return the original message for logging and fallback
  return normalizedError;
};

export const getErrorTranslationKey = (error: any): string => {
  // Handle backend errors that use 'error' field (like verifyCode endpoint)
  if (error?.response?.data?.error) {
    return mapErrorToTranslationKey(error.response.data.error);
  }
  
  // Handle backend errors that use 'message' field
  if (error?.response?.data?.message) {
    return mapErrorToTranslationKey(error.response.data.message);
  }
  
  // Handle client-side errors
  if (error?.message) {
    return mapErrorToTranslationKey(error.message);
  }
  
  return "auth_errors.server_error_general";
};