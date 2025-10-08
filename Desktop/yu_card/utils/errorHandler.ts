import { AxiosError } from 'axios';
import { ERROR_CODES } from './constants';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export class ErrorHandler {
  static handleAxiosError(error: AxiosError): AppError {
    const response = error.response;
    
    if (!response) {
      // Network error or no response
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
        statusCode: 0,
      };
    }

    const statusCode = response.status;
    const responseData = response.data as any;

    switch (statusCode) {
      case 400:
        return {
          code: responseData?.error || ERROR_CODES.VALIDATION_ERROR,
          message: responseData?.message || 'Données invalides ou manquantes',
          details: responseData?.data,
          statusCode,
        };

      case 401:
        return {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Session expirée. Veuillez vous reconnecter.',
          statusCode,
        };

      case 403:
        return {
          code: ERROR_CODES.FORBIDDEN,
          message: responseData?.message || 'Accès refusé',
          statusCode,
        };

      case 404:
        return {
          code: ERROR_CODES.NOT_FOUND,
          message: responseData?.message || 'Ressource non trouvée',
          statusCode,
        };

      case 409:
        return {
          code: responseData?.error || ERROR_CODES.VALIDATION_ERROR,
          message: responseData?.message || 'Conflit de données',
          statusCode,
        };

      case 413:
        return {
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: 'Fichier trop volumineux',
          statusCode,
        };

      case 429:
        return {
          code: ERROR_CODES.DAILY_LIMIT_REACHED,
          message: responseData?.message || 'Limite quotidienne atteinte',
          details: responseData?.data,
          statusCode,
        };

      case 500:
        return {
          code: ERROR_CODES.SERVER_ERROR,
          message: 'Erreur serveur interne',
          statusCode,
        };

      case 503:
        return {
          code: ERROR_CODES.AI_SERVICE_UNAVAILABLE,
          message: 'Service d\'IA temporairement indisponible',
          statusCode,
        };

      default:
        return {
          code: ERROR_CODES.SERVER_ERROR,
          message: responseData?.message || 'Une erreur inattendue s\'est produite',
          statusCode,
        };
    }
  }

  static handleGenericError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        code: ERROR_CODES.SERVER_ERROR,
        message: error.message,
      };
    }

    return {
      code: ERROR_CODES.SERVER_ERROR,
      message: 'Une erreur inconnue s\'est produite',
    };
  }

  static getErrorMessage(error: AppError, fallback?: string): string {
    return error.message || fallback || 'Une erreur s\'est produite';
  }

  static isNetworkError(error: AppError): boolean {
    return error.code === ERROR_CODES.NETWORK_ERROR;
  }

  static isAuthError(error: AppError): boolean {
    return error.code === ERROR_CODES.UNAUTHORIZED;
  }

  static shouldRetry(error: AppError): boolean {
    const retryableCodes = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.SERVER_ERROR,
      ERROR_CODES.AI_SERVICE_UNAVAILABLE,
    ] as const;
    
    return (retryableCodes as readonly string[]).includes(error.code);
  }

  static logError(error: AppError, context?: string): void {
    const logData = {
      context: context || 'Unknown',
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    };

    
    // In production, you might want to send this to a logging service
    // like Sentry, Bugsnag, or Firebase Crashlytics
  }
}