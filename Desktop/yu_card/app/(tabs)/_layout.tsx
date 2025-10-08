import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { AuthGuard } from '@/components/AuthGuard';
import useTranslation from '@/hooks/useTranslation';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray[600],
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.border.primary,
            paddingBottom: 5,
            paddingTop: 5,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '200',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home') || 'Accueil',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: t('tabs.categories') || 'Catégories',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2" color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: t('cart.title') || 'Panier',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="cart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: t('tabs.orders') || 'Commandes',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="bag" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile') || 'Profil',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.circle" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
