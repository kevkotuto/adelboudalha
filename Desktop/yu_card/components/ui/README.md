# Yu Card UI Components

Système de composants modernes et sobres pour l'application Yu Card.

## Palette de couleurs

- **Primaire**: Jaune poussin (#F4D03F)
- **Secondaire**: Noir (#000000)
- **Accent**: Blanc (#FFFFFF)
- **Style**: Minimal, sobre, avec shadows subtiles

## Police

- **Famille**: Ubuntu (Google Fonts)
- **Variants**: Light (300), Regular (400), Medium (500), Bold (700)

## Composants disponibles

### Typography
```tsx
import { Title, Paragraph, Caption } from '@/components/ui';

<Title level={1} color="primary">Mon titre</Title>
<Paragraph size="base" color="secondary">Mon paragraphe</Paragraph>
<Caption variant="label" color="accent">Ma légende</Caption>
```

### Inputs
```tsx
import { TextInput, NumberInput, SearchInput, PhoneInput } from '@/components/ui';

<TextInput
  label="Email"
  leftIcon="mail-outline"
  placeholder="votre@email.com"
/>

<NumberInput
  label="Montant"
  suffix="CFA"
  min={0}
  showSteppers
/>
```

### Buttons
```tsx
import { Button, IconButton, FloatingActionButton } from '@/components/ui';

<Button variant="primary" size="lg" leftIcon="add">
  Ajouter
</Button>

<IconButton icon="heart" variant="ghost" />

<FloatingActionButton
  icon="add"
  position="bottom-right"
  onPress={() => {}}
/>
```

### Cards
```tsx
import { GiftCard, ProductCard, BalanceCard } from '@/components/ui';

<GiftCard
  title="Carte cadeau iTunes"
  brand="Apple"
  amount={5000}
  currency="CFA"
  popular={true}
/>

<ProductCard
  name="iPhone 15 Pro"
  brand="Apple"
  price={850000}
  image="https://..."
  rating={4.5}
/>

<BalanceCard
  balance={25000}
  accountName="Mon Compte Yu Card"
  onTopUpPress={() => {}}
/>
```

### Payment (Wave Wallet uniquement)
```tsx
import { WavePaymentCard, WaveBottomSheet } from '@/components/ui';

<WavePaymentCard
  amount={5000}
  currency="CFA"
  description="Achat gift card"
  onPayPress={(phone) => console.log('Pay with:', phone)}
/>

// Utilisation avec BottomSheet
const bottomSheetRef = useRef<BottomSheet>(null);

<WaveBottomSheet
  ref={bottomSheetRef}
  amount={5000}
  description="Achat iTunes Card"
  onPaymentSuccess={() => {}}
/>
```

### Layout
```tsx
import {
  Container,
  SafeAreaWrapper,
  Card,
  Divider,
  EmptyState,
  LoadingSpinner
} from '@/components/ui';

<SafeAreaWrapper>
  <Container variant="padded">
    <Card variant="elevated" padding="lg">
      <Title>Contenu</Title>
      <Divider label="Séparateur" />
      <Paragraph>Plus de contenu...</Paragraph>
    </Card>
  </Container>
</SafeAreaWrapper>

<EmptyState
  icon="gift-outline"
  title="Aucune gift card"
  description="Commencez par acheter votre première gift card"
  actionLabel="Parcourir"
  onActionPress={() => {}}
/>

<LoadingSpinner
  size="large"
  text="Chargement..."
  variant="fullscreen"
/>
```

## Système de design

### Couleurs
```tsx
import { Colors } from '@/constants';

// Couleurs primaires
Colors.primary        // Jaune poussin
Colors.black         // Noir
Colors.white         // Blanc

// Couleurs de texte
Colors.text.primary   // Noir
Colors.text.secondary // Gris
Colors.text.accent    // Jaune

// Wave Wallet
Colors.wave.primary   // Orange Wave
```

### Spacing
```tsx
import { Spacing } from '@/constants';

Spacing.xs    // 4px
Spacing.sm    // 8px
Spacing.md    // 12px
Spacing.lg    // 16px
Spacing.xl    // 20px
```

### Typographie
```tsx
import { Typography } from '@/constants';

Typography.fonts.ubuntu.regular
Typography.styles.h1
Typography.sizes.base
```

### Shadows (minimales)
```tsx
import { Shadows } from '@/constants';

Shadows.card    // Ombre subtile pour cartes
Shadows.button  // Ombre légère pour boutons
Shadows.none    // Pas d'ombre
```

## Bonnes pratiques

1. **Toujours utiliser les composants UI** plutôt que les éléments React Native natifs
2. **Respecter la palette de couleurs** noir/blanc/jaune poussin
3. **Utiliser Ubuntu** comme police pour tous les textes
4. **Shadows minimales** - éviter les ombres excessives
5. **Wave Wallet uniquement** pour les paiements
6. **Tests** - Tester tous les composants sur iOS et Android

## Exemples d'usage

Voir le fichier `/app/auth/login.tsx` pour un exemple complet d'intégration des composants.