// Mock Data for Yu Card App
export interface GiftCardData {
  id: string;
  title: string;
  brand: string;
  image : any; // Changed to any to support require()
  amount?: number;
  currency: string;
  category: 'gaming' | 'tech' | 'entertainment' | 'shopping';
  backgroundImage?: string;
  backgroundColor?: string;
  gradientColors?: [string, string];
  popular?: boolean;
  discount?: number;
  stock: number;
  description: string;
}

export interface PhysicalProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  category: 'smartphone' | 'tablet' | 'accessories' | 'gaming' | 'laptop';
  images: string[];
  description: string;
  specifications: { [key: string]: string };
  stock: number;
  rating: number;
  reviewCount: number;
  popular?: boolean;
  discount?: number;
  deliveryTime: string;
}

export interface OrderData {
  id: string;
  userId: string;
  type: 'gift_card' | 'physical_product';
  itemId: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'wave';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  tracking?: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
  };
  giftCardCode?: string;
}

export interface UserData {
  id: string;
  fullName: string;
  phone: string;
  role: 'client' | 'admin';
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  preferences: {
    language: 'fr' | 'en' | 'ar' | 'es' | 'bm';
    notifications: boolean;
    newsletter: boolean;
  };
  address?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export interface StatisticsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  popularGiftCards: string[];
  popularProducts: string[];
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}

// Mock Gift Cards Data
export const mockGiftCards: GiftCardData[] = [
  {
    id: 'gc-1',
    title: 'Carte cadeau Apple Store',
    brand: 'Apple',
    image: require('../assets/images/plays.png'),
    amount: 25000,
    currency: 'CFA',
    category: 'tech',
    gradientColors: ['#007AFF', '#5856D6'],
    popular: true,
    stock: 100,
    description: 'Utilisez cette carte cadeau Apple pour acheter des apps, des jeux, de la musique et plus encore sur l\'App Store.',
  },
  {
    id: 'gc-2',
    title: 'PlayStation Store Gift Card',
    brand: 'PlayStation',
    image: require('../assets/images/plays.png'),
    amount: 20000,
    currency: 'CFA',
    category: 'gaming',
    gradientColors: ['#003087', '#0070D1'],
    popular: true,
    discount: 5,
    stock: 75,
    description: 'Achetez vos jeux préférés, extensions et contenus sur le PlayStation Store.',
  },
  {
    id: 'gc-3',
    title: 'Xbox Live Gold Gift Card',
    brand: 'Xbox',
    amount: 15000,
    image: require('../assets/images/plays.png'),
    currency: 'CFA',
    category: 'gaming',
    gradientColors: ['#107C10', '#0E7A0B'],
    stock: 50,
    description: 'Accédez aux jeux en ligne, aux offres exclusives et aux jeux gratuits sur Xbox.',
  },
  {
    id: 'gc-4',
    title: 'Nintendo eShop Card',
    brand: 'Nintendo',
    image: require('../assets/images/plays.png'),
    amount: 30000,
    currency: 'CFA',
    category: 'gaming',
    gradientColors: ['#E60012', '#FF6B6B'],
    stock: 60,
    description: 'Téléchargez des jeux Nintendo Switch et du contenu numérique sur le Nintendo eShop.',
  },
  {
    id: 'gc-5',
    title: 'Google Play Gift Card',
    brand: 'Google Play',
    image: require('../assets/images/plays.png'),
    amount: 10000,
    currency: 'CFA',
    category: 'entertainment',
    gradientColors: ['#4285F4', '#34A853'],
    stock: 90,
    description: 'Achetez des applications, jeux, films et livres sur Google Play Store.',
  },
  {
    id: 'gc-6',
    title: 'Spotify Premium Card',
    brand: 'Spotify',
    amount: 12000,
    image: require('../assets/images/plays.png'),
    currency: 'CFA',
    category: 'entertainment',
    gradientColors: ['#1DB954', '#1ED760'],
    stock: 40,
    description: 'Profitez de la musique sans publicité avec Spotify Premium.',
  },
];

// Mock Physical Products Data
export const mockPhysicalProducts: PhysicalProductData[] = [
  {
    id: 'pp-1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 650000,
    currency: 'CFA',
    category: 'smartphone',
    images: ['iphone15pro-1.jpg', 'iphone15pro-2.jpg'],
    description: 'Le tout nouveau iPhone 15 Pro avec puce A17 Pro et appareil photo professionnel.',
    specifications: {
      'Écran': '6.1" Super Retina XDR',
      'Stockage': '128GB',
      'Caméra': '48MP Principal',
      'Batterie': 'Jusqu\'à 23h de lecture vidéo',
      'Couleur': 'Titane Naturel',
    },
    stock: 25,
    rating: 4.8,
    reviewCount: 127,
    popular: true,
    deliveryTime: '2-3 jours',
  },
  {
    id: 'pp-2',
    name: 'iPad Air',
    brand: 'Apple',
    price: 350000,
    currency: 'CFA',
    category: 'tablet',
    images: ['ipadair-1.jpg', 'ipadair-2.jpg'],
    description: 'iPad Air avec puce M1 pour des performances exceptionnelles.',
    specifications: {
      'Écran': '10.9" Liquid Retina',
      'Stockage': '64GB',
      'Processeur': 'Puce M1',
      'Caméra': '12MP Ultra Wide',
      'Couleur': 'Gris Sidéral',
    },
    stock: 15,
    rating: 4.7,
    reviewCount: 89,
    deliveryTime: '3-5 jours',
  },
  {
    id: 'pp-3',
    name: 'AirPods Pro',
    brand: 'Apple',
    price: 150000,
    currency: 'CFA',
    category: 'accessories',
    images: ['airpodspro-1.jpg', 'airpodspro-2.jpg'],
    description: 'AirPods Pro avec suppression active du bruit et son spatial.',
    specifications: {
      'Type': 'Écouteurs sans fil',
      'Autonomie': 'Jusqu\'à 30h avec boîtier',
      'Résistance': 'IPX4',
      'Fonctionnalités': 'Suppression active du bruit',
    },
    stock: 40,
    rating: 4.6,
    reviewCount: 203,
    popular: true,
    discount: 10,
    deliveryTime: '1-2 jours',
  },
  {
    id: 'pp-4',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    price: 450000,
    currency: 'CFA',
    category: 'smartphone',
    images: ['galaxys24-1.jpg', 'galaxys24-2.jpg'],
    description: 'Samsung Galaxy S24 avec Galaxy AI et caméra professionnelle.',
    specifications: {
      'Écran': '6.2" Dynamic AMOLED',
      'Stockage': '128GB',
      'Caméra': '50MP Triple caméra',
      'Batterie': '4000mAh',
      'Couleur': 'Violet Cobalt',
    },
    stock: 30,
    rating: 4.5,
    reviewCount: 156,
    deliveryTime: '2-4 jours',
  },
  {
    id: 'pp-5',
    name: 'MacBook Air M2',
    brand: 'Apple',
    price: 750000,
    currency: 'CFA',
    category: 'laptop',
    images: ['macbookair-1.jpg', 'macbookair-2.jpg'],
    description: 'MacBook Air avec puce M2 pour une performance révolutionnaire.',
    specifications: {
      'Écran': '13.6" Liquid Retina',
      'Processeur': 'Puce M2',
      'Mémoire': '8GB RAM unifiée',
      'Stockage': '256GB SSD',
      'Couleur': 'Gris Sidéral',
    },
    stock: 12,
    rating: 4.9,
    reviewCount: 94,
    popular: true,
    deliveryTime: '5-7 jours',
  },
  {
    id: 'pp-6',
    name: 'PlayStation 5',
    brand: 'Sony',
    price: 320000,
    currency: 'CFA',
    category: 'gaming',
    images: ['ps5-1.jpg', 'ps5-2.jpg'],
    description: 'Console PlayStation 5 avec des graphismes 4K et des temps de chargement ultra-rapides.',
    specifications: {
      'Processeur': 'AMD Zen 2',
      'GPU': 'AMD RDNA 2',
      'Stockage': '825GB SSD',
      'Résolution': 'Jusqu\'à 4K',
      'Contenu': 'Console + Manette DualSense',
    },
    stock: 8,
    rating: 4.8,
    reviewCount: 312,
    deliveryTime: '3-6 jours',
  },
];

// Mock Orders Data
export const mockOrders: OrderData[] = [
  {
    id: 'ord-1',
    userId: 'user-1',
    type: 'gift_card',
    itemId: 'gc-1',
    itemName: 'Carte cadeau Apple Store - 25,000 CFA',
    quantity: 1,
    totalAmount: 25000,
    currency: 'CFA',
    status: 'confirmed',
    paymentMethod: 'wave',
    paymentStatus: 'completed',
    orderDate: '2024-01-15T10:30:00Z',
    giftCardCode: 'APPLE-XXXX-XXXX-XXXX',
  },
  {
    id: 'ord-2',
    userId: 'user-1',
    type: 'physical_product',
    itemId: 'pp-3',
    itemName: 'AirPods Pro',
    quantity: 1,
    totalAmount: 135000,
    currency: 'CFA',
    status: 'shipped',
    paymentMethod: 'wave',
    paymentStatus: 'completed',
    orderDate: '2024-01-10T14:20:00Z',
    shippingAddress: {
      fullName: 'Amadou Diallo',
      phone: '+221 77 123 45 67',
      address: 'Avenue Cheikh Anta Diop, Immeuble A, Appt 12',
      city: 'Dakar',
      postalCode: '10200',
    },
    tracking: {
      trackingNumber: 'YC2024010001',
      carrier: 'Yu Card Express',
      estimatedDelivery: '2024-01-16',
    },
  },
  {
    id: 'ord-3',
    userId: 'user-2',
    type: 'physical_product',
    itemId: 'pp-1',
    itemName: 'iPhone 15 Pro',
    quantity: 1,
    totalAmount: 650000,
    currency: 'CFA',
    status: 'processing',
    paymentMethod: 'wave',
    paymentStatus: 'completed',
    orderDate: '2024-01-12T09:15:00Z',
    shippingAddress: {
      fullName: 'Fatou Sow',
      phone: '+221 70 987 65 43',
      address: 'Rue 10, Point E',
      city: 'Dakar',
      postalCode: '10700',
    },
  },
  {
    id: 'ord-4',
    userId: 'user-1',
    type: 'gift_card',
    itemId: 'gc-2',
    itemName: 'PlayStation Store Gift Card - 20,000 CFA',
    quantity: 2,
    totalAmount: 38000,
    currency: 'CFA',
    status: 'pending',
    paymentMethod: 'wave',
    paymentStatus: 'pending',
    orderDate: '2024-01-16T16:45:00Z',
  },
];

// Mock Users Data
export const mockUsers: UserData[] = [
  {
    id: 'user-1',
    fullName: 'Amadou Diallo',
    phone: '+221 77 123 45 67',
    role: 'client',
    joinDate: '2023-08-15T12:00:00Z',
    lastLogin: '2024-01-16T08:30:00Z',
    preferences: {
      language: 'fr',
      notifications: true,
      newsletter: true,
    },
    address: {
      fullName: 'Amadou Diallo',
      phone: '+221 77 123 45 67',
      address: 'Avenue Cheikh Anta Diop, Immeuble A, Appt 12',
      city: 'Dakar',
      postalCode: '10200',
    },
  },
  {
    id: 'user-2',
    fullName: 'Fatou Sow',
    phone: '+221 70 987 65 43',
    role: 'client',
    joinDate: '2023-11-20T15:30:00Z',
    lastLogin: '2024-01-15T19:20:00Z',
    preferences: {
      language: 'fr',
      notifications: false,
      newsletter: true,
    },
    address: {
      fullName: 'Fatou Sow',
      phone: '+221 70 987 65 43',
      address: 'Rue 10, Point E',
      city: 'Dakar',
      postalCode: '10700',
    },
  },
  {
    id: 'admin-1',
    fullName: 'Administrateur Yu Card',
    phone: '+221 33 123 45 67',
    role: 'admin',
    joinDate: '2023-01-01T00:00:00Z',
    lastLogin: '2024-01-16T11:00:00Z',
    preferences: {
      language: 'fr',
      notifications: true,
      newsletter: false,
    },
  },
];

// Mock Statistics Data
export const mockStatistics: StatisticsData = {
  totalOrders: 1247,
  totalRevenue: 45890000,
  pendingOrders: 23,
  completedOrders: 1156,
  totalCustomers: 634,
  totalProducts: 45,
  popularGiftCards: ['gc-1', 'gc-2', 'gc-5'],
  popularProducts: ['pp-1', 'pp-3', 'pp-5'],
  revenueByMonth: [
    { month: 'Jan', revenue: 3200000 },
    { month: 'Fév', revenue: 4100000 },
    { month: 'Mar', revenue: 3800000 },
    { month: 'Avr', revenue: 4500000 },
    { month: 'Mai', revenue: 5200000 },
    { month: 'Jun', revenue: 4800000 },
    { month: 'Jul', revenue: 5500000 },
    { month: 'Aoû', revenue: 5100000 },
    { month: 'Sep', revenue: 4700000 },
    { month: 'Oct', revenue: 5800000 },
    { month: 'Nov', revenue: 6200000 },
    { month: 'Déc', revenue: 7100000 },
  ],
  ordersByStatus: [
    { status: 'completed', count: 1156 },
    { status: 'shipped', count: 34 },
    { status: 'processing', count: 18 },
    { status: 'pending', count: 23 },
    { status: 'cancelled', count: 16 },
  ],
};

// Helper functions
export const getGiftCardById = (id: string): GiftCardData | undefined => {
  return mockGiftCards.find(card => card.id === id);
};

export const getPhysicalProductById = (id: string): PhysicalProductData | undefined => {
  return mockPhysicalProducts.find(product => product.id === id);
};

export const getOrdersByUserId = (userId: string): OrderData[] => {
  return mockOrders.filter(order => order.userId === userId);
};

export const getUserById = (id: string): UserData | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getPopularGiftCards = (): GiftCardData[] => {
  return mockGiftCards.filter(card => card.popular);
};

export const getPopularProducts = (): PhysicalProductData[] => {
  return mockPhysicalProducts.filter(product => product.popular);
};

export const getGiftCardsByCategory = (category: string): GiftCardData[] => {
  return mockGiftCards.filter(card => card.category === category);
};

export const getProductsByCategory = (category: string): PhysicalProductData[] => {
  return mockPhysicalProducts.filter(product => product.category === category);
};

// Fonction générique pour récupérer un produit par ID (gift card ou produit physique)
export const getProductById = (id: string): GiftCardData | PhysicalProductData | undefined => {
  const giftCard = getGiftCardById(id);
  if (giftCard) return giftCard;

  return getPhysicalProductById(id);
};