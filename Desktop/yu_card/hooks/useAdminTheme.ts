import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export function useAdminTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? Colors.admin.dark : Colors.admin.light,
    isDark,
  };
}
