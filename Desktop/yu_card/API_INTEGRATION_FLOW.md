# API Integration Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Yu Card Mobile App                       │
│                    (React Native + Expo)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Services Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Categories │  │ Gift Cards │  │  Products  │            │
│  │  Service   │  │  Service   │  │  Service   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐                                             │
│  │   Search   │     All use apiClient (Axios + Auth)       │
│  │  Service   │                                             │
│  └────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│                   (Node.js + Express)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Categories Controller  │  Products Controller     │    │
│  │  - GET /categories      │  - GET /products         │    │
│  │  - GET /categories/:id  │  - GET /products/popular │    │
│  │  - GET /categories/slug │  - GET /products/featured│    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Gift Cards Controller  │  Search Controller       │    │
│  │  - GET /gift-cards      │  - GET /search           │    │
│  │  - GET /gift-cards/pop  │  - GET /search/auto      │    │
│  │  - GET /gift-cards/feat │  - GET /search/trending  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌──────────────────┐   ┌──────────────────┐
        │   PostgreSQL     │   │  Elasticsearch   │
        │   (Prisma ORM)   │   │  (Search Index)  │
        │                  │   │                  │
        │  - Categories    │   │  - Products      │
        │  - GiftCards     │   │  - Gift Cards    │
        │  - Products      │   │  - Categories    │
        └──────────────────┘   └──────────────────┘
```

## Data Flow Examples

### 1. Home Screen Load

```
User Opens App
      │
      ▼
app/(tabs)/index.tsx
      │
      ├─→ giftCardsService.getPopularGiftCards(10)
      │         │
      │         ▼
      │   GET /api/gift-cards/popular?limit=10
      │         │
      │         ▼
      │   Backend returns GiftCard[]
      │
      ├─→ productsService.getPopularProducts(10)
      │         │
      │         ▼
      │   GET /api/products/popular?limit=10
      │         │
      │         ▼
      │   Backend returns PhysicalProduct[]
      │
      └─→ categoriesService.getPopularCategories(6)
                │
                ▼
          GET /api/categories?limit=50
                │
                ▼
          Backend returns Category[]
          (sorted by product count)
                │
                ▼
          Display on Home Screen
```

### 2. Search Flow

```
User Types in Search Bar
      │
      ▼
app/search.tsx
      │
      ├─→ (debounce 300ms) ─→ searchService.getAutocompleteSuggestions(query)
      │                              │
      │                              ▼
      │                        GET /api/search/autocomplete?q=query
      │                              │
      │                              ▼
      │                        Show Suggestions Dropdown
      │
      ▼
User Submits Search
      │
      ▼
Navigate to app/search-results.tsx
      │
      ▼
searchService.globalSearch({
  q: query,
  productType: 'all',
  sort: '_score',
  limit: 50
})
      │
      ▼
GET /api/search?q=query&productType=all&sort=_score&limit=50
      │
      ▼
Elasticsearch Returns Results
      │
      ▼
Display Combined Gift Cards + Products
```

### 3. Category Navigation

```
User Clicks Category
      │
      ▼
Navigate with category.slug
      │
      ▼
app/search-results.tsx?category=gaming
      │
      ▼
searchService.globalSearch({
  category: 'gaming',
  productType: 'all'
})
      │
      ▼
GET /api/search?category=gaming&productType=all
      │
      ▼
Backend filters by category slug
      │
      ▼
Display Filtered Results
```

### 4. Filter & Sort Flow

```
User Applies Filters
      │
      ├─→ Type: gift_card
      ├─→ Popular: true
      └─→ Sort: price_asc
      │
      ▼
searchService.globalSearch({
  productType: 'gift_card',
  popular: true,
  sort: 'price',
  order: 'asc'
})
      │
      ▼
GET /api/search?productType=gift_card&popular=true&sort=price&order=asc
      │
      ▼
Backend applies filters + sorting
      │
      ▼
Display Sorted Filtered Results
```

## Screen → API Mapping

### Home Screen (index.tsx)
| Component | API Call | Endpoint |
|-----------|----------|----------|
| Popular Gift Cards | `giftCardsService.getPopularGiftCards()` | `GET /api/gift-cards/popular` |
| Popular Products | `productsService.getPopularProducts()` | `GET /api/products/popular` |
| Categories | `categoriesService.getPopularCategories()` | `GET /api/categories` |

### Categories Screen (categories.tsx)
| Component | API Call | Endpoint |
|-----------|----------|----------|
| All Categories | `categoriesService.getCategories()` | `GET /api/categories` |
| Category Counts | Backend `_count` aggregation | Included in response |

### Search Results (search-results.tsx)
| Component | API Call | Endpoint |
|-----------|----------|----------|
| Search Results | `searchService.globalSearch()` | `GET /api/search` |
| Autocomplete | `searchService.getAutocompleteSuggestions()` | `GET /api/search/autocomplete` |

### Search Screen (search.tsx)
| Component | API Call | Endpoint |
|-----------|----------|----------|
| Autocomplete | `searchService.getAutocompleteSuggestions()` | `GET /api/search/autocomplete` |
| Recent Searches | AsyncStorage (local) | N/A |

## Type Transformations

### GiftCard Backend → Frontend
```typescript
// Backend (Prisma)
{
  id: string (UUID)
  title: string
  imageUrl: string
  minAmount: Decimal
  gradientStart: string
  gradientEnd: string
  isPopular: boolean
  discountPercentage: Decimal
}

// Frontend (Component Props)
{
  id: string
  title: string
  image: { uri: string }
  amount: number
  gradientColors: [string, string]
  popular: boolean
  discount: number
}
```

### PhysicalProduct Backend → Frontend
```typescript
// Backend (Prisma)
{
  id: string (UUID)
  name: string
  price: Decimal
  images: string[] (JSON)
  rating: Decimal
  reviewCount: number
}

// Frontend (Component Props)
{
  id: string
  name: string
  price: number
  image: string
  rating: number
  reviewCount: number
}
```

### Category Backend → Frontend
```typescript
// Backend (Prisma)
{
  id: string (UUID)
  name: string
  slug: string
  iconUrl?: string
  _count: {
    giftCards: number
    physicalProducts: number
  }
}

// Frontend (Component Props)
{
  id: string
  name: string
  slug: string
  image: ImageSourcePropType
  // count calculated from _count
}
```

## API Client Architecture

```
┌─────────────────────────────────────────────────┐
│              apiClient (Axios)                   │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Request Interceptor              │  │
│  │  - Add Authorization Bearer Token        │  │
│  │  - Set Content-Type headers              │  │
│  └──────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │         HTTP Request to Backend          │  │
│  └──────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │         Response Interceptor             │  │
│  │  - Handle 401 (Token Refresh)            │  │
│  │  - Queue failed requests                 │  │
│  │  - Retry on success                      │  │
│  └──────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │         Error Handler                    │  │
│  │  - Transform errors                      │  │
│  │  - Return fallback data                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Service Methods Summary

### categoriesService
- ✅ `getCategories(params)` - List with filters
- ✅ `getCategoryById(id)` - Single by ID
- ✅ `getCategoryBySlug(slug)` - Single by slug
- ✅ `getRootCategories(type?)` - Top-level only
- ✅ `getPopularCategories(limit)` - Sorted by count

### giftCardsService
- ✅ `getGiftCards(params)` - List with filters
- ✅ `getGiftCardById(id)` - Single by ID
- ✅ `getPopularGiftCards(limit)` - Popular items
- ✅ `getFeaturedGiftCards(limit)` - Featured items
- ✅ `getGiftCardsByCategory(slug)` - Filter by category
- ✅ `getGiftCardsByBrand(brand)` - Filter by brand
- ✅ `searchGiftCards(query, filters)` - Search

### productsService
- ✅ `getProducts(params)` - List with filters
- ✅ `getProductById(id)` - Single by ID
- ✅ `getPopularProducts(limit)` - Popular items
- ✅ `getFeaturedProducts(limit)` - Featured items
- ✅ `getProductsByCategory(slug)` - Filter by category
- ✅ `getProductsByBrand(brand)` - Filter by brand
- ✅ `getRelatedProducts(id)` - Related items
- ✅ `checkStock(id)` - Stock availability

### searchService
- ✅ `globalSearch(params)` - Multi-type search
- ✅ `searchGiftCards(query, filters)` - Gift card search
- ✅ `searchProducts(query, filters)` - Product search
- ✅ `getAutocompleteSuggestions(query)` - Autocomplete
- ✅ `getTrendingSearches()` - Trending queries
- ✅ `getSearchHistory()` - User history
- ✅ `searchByCategory(id, params)` - Category search

## Performance Features

### Optimizations Implemented
1. ✅ **Parallel API Calls** - Multiple requests with `Promise.all()`
2. ✅ **Debounced Autocomplete** - 300ms delay on typing
3. ✅ **Local Storage** - Recent searches cached
4. ✅ **Fallback Data** - Empty arrays on error
5. ✅ **Loading States** - Skeleton screens during fetch
6. ✅ **Error Boundaries** - Try/catch on all calls

### Ready for Implementation
- ⏳ **React Query/SWR** - Advanced caching
- ⏳ **Infinite Scroll** - Pagination support ready
- ⏳ **Image Caching** - Fast Image component
- ⏳ **Offline Support** - Service worker ready

---

**All API integrations are complete and functional! 🎉**
