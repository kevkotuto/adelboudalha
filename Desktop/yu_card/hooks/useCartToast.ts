import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import useTranslation from './useTranslation';

/**
 * Hook for displaying cart-related toast notifications
 * Supports multi-language and follows Yu Card design system
 */
export const useCartToast = () => {
  const { t } = useTranslation();

  /**
   * Show success toast when item is added to cart
   */
  const showAddedToCart = useCallback(
    (productName: string) => {
      Toast.show({
        type: 'cartToast',
        text1: t('cart.toast.added_title'),
        text2: t('cart.toast.added_subtitle', { product: productName }),
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
        onPress: () => {
          Toast.hide();
          router.push('/(tabs)/cart');
        },
        props: {
          variant: 'success',
        },
      });
    },
    [t]
  );

  /**
   * Show error toast when adding to cart fails
   */
  const showAddToCartError = useCallback(
    (errorMessage?: string) => {
      Toast.show({
        type: 'cartToast',
        text1: t('cart.toast.error_title'),
        text2: errorMessage || t('cart.toast.error_subtitle'),
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 60,
        props: {
          variant: 'error',
        },
      });
    },
    [t]
  );

  /**
   * Show success toast when item is removed from cart
   */
  const showRemovedFromCart = useCallback(
    (productName?: string) => {
      Toast.show({
        type: 'cartToast',
        text1: t('cart.toast.removed_title'),
        text2: productName
          ? t('cart.toast.removed_subtitle', { product: productName })
          : t('cart.toast.removed_subtitle_generic'),
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 60,
        props: {
          variant: 'success',
        },
      });
    },
    [t]
  );

  /**
   * Show success toast when cart is cleared
   */
  const showCartCleared = useCallback(() => {
    Toast.show({
      type: 'cartToast',
      text1: t('cart.toast.cleared_title'),
      text2: t('cart.toast.cleared_subtitle'),
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 60,
      props: {
        variant: 'success',
      },
    });
  }, [t]);

  /**
   * Show info toast when quantity is updated
   */
  const showQuantityUpdated = useCallback(() => {
    Toast.show({
      type: 'cartToast',
      text1: t('cart.toast.quantity_updated_title'),
      text2: t('cart.toast.quantity_updated_subtitle'),
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 60,
      props: {
        variant: 'success',
      },
    });
  }, [t]);

  return {
    showAddedToCart,
    showAddToCartError,
    showRemovedFromCart,
    showCartCleared,
    showQuantityUpdated,
  };
};

export default useCartToast;
