import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import useTranslation from '@/hooks/useTranslation';

export default function AdminTabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 8,
          right: 8,
          backgroundColor: 'transparent',
          borderRadius: 24,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: Colors.black,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="extraLight"
            style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.7)' }]}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('admin_tabs.dashboard'),
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('admin_tabs.orders'),
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="bag.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t('admin_tabs.products'),
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="cube.box.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('admin_tabs.categories'),
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('admin_tabs.settings'),
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="gearshape.fill" color={color} />,
        }}
      />
      {/* Hidden tabs - accessible via Settings */}
      <Tabs.Screen
        name="delivery"
        options={{
          href: null, // Hide from tab bar - not finished yet
        }}
      />
      <Tabs.Screen
        name="gift-codes"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="financial-report"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="audit-logs"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
