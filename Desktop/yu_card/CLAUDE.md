# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `expo start` or `npm start`
- **Run on iOS**: `expo start --ios` or `npm run ios`
- **Run on Android**: `expo start --android` or `npm run android`
- **Run on web**: `expo start --web` or `npm run web`
- **Lint code**: `expo lint` or `npm run lint`
- **Reset project**: `npm run reset-project` (moves starter code to app-example, creates blank app directory)

## Architecture Overview

This is an Expo React Native application using Expo Router for file-based routing, built specifically for Yu Card - a gift card and electronics sales platform with Wave Wallet as the exclusive payment method.

### Core Architecture Patterns

- **Expo Router**: File-based routing with tab navigation layout in `app/(tabs)/`
- **Custom UI System**: Comprehensive design system in `components/ui/` following black/white/chick-yellow color palette
- **Design System**: Centralized theme system with Ubuntu font family and minimal shadows approach
- **Wave Wallet Integration**: Specialized payment components for Wave mobile money (only payment method)
- **Multi-language Support**: 5 languages (French, English, Arabic, Spanish, Bambara) with i18n system

### Key Directories

- **app/**: Expo Router pages with file-based routing
- **app/(tabs)/**: Bottom tab navigation screens
- **app/auth/**: Authentication flow screens
- **components/ui/**: Complete custom UI component library organized by type
- **constants/**: Design system (Colors, Typography, Spacing, Shadows, BorderRadius)
- **i18n/translations/**: Multi-language translation files

### Design System Architecture

**Yu Card Brand Identity:**
- **Primary Color**: Chick Yellow (#F4D03F) - used for primary actions and highlights
- **Secondary Colors**: Black (#000000) and White (#FFFFFF)
- **Typography**: Ubuntu font family (Light 300, Regular 400, Medium 500, Bold 700)
- **Shadow Philosophy**: Minimal, subtle shadows only - avoid excessive shadow effects
- **Style Approach**: Clean, modern, minimal design

**Component Categories:**
- **Typography**: Title, Paragraph, Caption with consistent styling
- **Inputs**: TextInput, NumberInput, SearchInput, PhoneInput with icons and validation
- **Buttons**: Button, IconButton, FloatingActionButton with multiple variants
- **Cards**: GiftCard, ProductCard, BalanceCard for e-commerce display
- **Payment**: WavePaymentCard, WaveBottomSheet for Wave Wallet integration
- **Layout**: Container, SafeAreaWrapper, Card, Divider, EmptyState, LoadingSpinner

### Application Screens Structure

#### Authentication Flow (`app/auth/`)
- **auth/login.tsx** - Login screen demonstrating UI component integration

#### Main Application (`app/(tabs)/`)
- **index.tsx** - Home screen (tab 1)
- **explore.tsx** - Product/gift card browsing (tab 2)

#### System Screens
- **modal.tsx** - Modal screen template

### Key Features

- **Gift Card Sales**: Primary business focus with specialized GiftCard components
- **Electronics Sales**: ProductCard components for phones and electronics
- **Wave Wallet Payments**: Exclusive payment method with dedicated UI components
- **Multi-language Support**: 5 languages with complete translation system
- **Ubuntu Typography**: Google Fonts integration with automatic loading
- **Minimal Design**: Clean interface following minimal shadow philosophy

### Configuration

- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to root)
- **Expo Config**: New Architecture enabled, edge-to-edge Android support, React Compiler enabled
- **Platform Support**: iOS, Android, and web with platform-specific optimizations
- **Custom Scheme**: `yucard://` for deep linking
- **Font Loading**: Ubuntu fonts embedded via expo-font plugin

### Internationalization (i18n) System

#### Supported Languages
- **French (fr)** - Primary language
- **English (en)** - Secondary language
- **Arabic (ar)** - Arabic with RTL support potential
- **Spanish (es)** - Spanish translations
- **Bambara (bm)** - West African language

#### Translation File Structure
Currently basic structure with sections for:
- `common` - Common UI elements (continue, cancel, save, etc.)
- `auth` - Authentication related text
- `tabs` - Tab navigation labels
- `languages` - Language selection interface
- `onboarding` - App introduction screens

**Development Rule**: All user-facing text must be internationalized using translation keys, never hardcoded strings.

### Payment Integration

**Wave Wallet Only**: This application exclusively uses Wave mobile money for payments. No other payment methods are supported.

- **WavePaymentCard**: Main payment interface component
- **WaveBottomSheet**: Modal payment flow with validation
- **Senegal Focus**: Phone number formatting optimized for Senegalese numbers (+221)

### UI Component Usage Philosophy

1. **Always use custom UI components** from `@/components/ui` instead of raw React Native components
2. **Respect the brand colors**: Primary (chick yellow), black, white
3. **Typography consistency**: Ubuntu fonts only
4. **Minimal shadows**: Avoid excessive shadow effects per design preference
5. **Wave Wallet integration**: Use provided payment components for all transactions

### Dependencies & Libraries

**Core Framework:**
- Expo SDK 54 with React Native 0.81.4
- React 19.1.0 with new experimental features enabled

**Key Libraries:**
- `@gorhom/bottom-sheet`: For modal interfaces
- `@expo-google-fonts/ubuntu`: Typography system
- `expo-linear-gradient`: Card gradients and visual effects
- `react-native-gesture-handler` & `react-native-reanimated`: Animations and gestures
- `react-native-svg`: Vector graphics support

**Notable Configuration:**
- New Architecture enabled for React Native
- React Compiler experimental feature enabled
- Typed routes enabled for better TypeScript integration
- Edge-to-edge enabled for Android

### Development Notes

- All new screens should use the established UI component library
- Payment flows must integrate with Wave Wallet exclusively
- Text content must be internationalized across all 5 supported languages
- Design should follow the minimal shadow philosophy
- Ubuntu font family should be used consistently throughout the application