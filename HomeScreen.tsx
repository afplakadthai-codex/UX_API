import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fetchMarketplaceListings, MarketplaceListing } from '../services/api/marketplace';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/AppNavigator';

type FeedStatus = 'idle' | 'loading' | 'refreshing' | 'error' | 'success';

type RatingValue = {
  average?: number | string | null;
  avg?: number | string | null;
  count?: number | string | null;
};

type ListingCardData = MarketplaceListing & {
  auction_enabled?: boolean | number | string | null;
  auctionEnabled?: boolean | number | string | null;
  avg_rating?: number | string | null;
  avgRating?: number | string | null;
  cover_image?: string | null;
  coverImage?: string | null;
  cover_image_url?: string | null;
  currency?: string | null;
  price?: number | string | null;
   priceFormatted?: string | null;
  priceAmount?: number | string | null;
  priceCurrency?: string | null;
  discounted_price?: number | string | null;
  discountedPrice?: number | string | null;
  farm_logo?: string | null;
  farm_name?: string | null;
  farmLogo?: string | null;
  farmName?: string | null;
   sellerFarmLogo?: string | null;
  sellerFarmName?: string | null;
  shop_logo?: string | null;
  shop_name?: string | null;
  shopLogo?: string | null;
  shopName?: string | null;
  store_logo?: string | null;
  store_name?: string | null;
  storeLogo?: string | null;
  storeName?: string | null; 
  final_price?: number | string | null;
  finalPrice?: number | string | null;
  basePrice?: number | string | null;
  base_price?: number | string | null;
  shortDescription?: string | null;
  short_description?: string | null;
  description?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  is_auction?: boolean | number | string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  media?: Array<{ url?: string | null; src?: string | null }> | null;
  images?: Array<{ url?: string | null; src?: string | null }> | null;
  isAuction?: boolean | number | string | null;
  logo_url?: string | null;
  logoUrl?: string | null;
  original_price?: number | string | null;
  originalPrice?: number | string | null;
  rating?: number | string | RatingValue | null;
  review_average?: number | string | null;
  reviewAverage?: number | string | null;
  review_count?: number | string | null;
  reviewCount?: number | string | null;
  reviews_count?: number | string | null;
  seller_logo?: string | null;
  seller_name?: string | null;
  sellerLogo?: string | null;
  sellerName?: string | null;
  status?: string | null;
};

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const getOptimizedImageUrl = (url?: string | null, width = 900): string | null => {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&q=75`;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toBoolean = (value: boolean | number | string | null | undefined) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return hasText(value) ? ['1', 'true', 'yes'].includes(value.trim().toLowerCase()) : false;
};

const formatPrice = (price: number | string, currency: string) => {
  const normalizedCurrency = currency.toUpperCase();
  const priceText = String(price).trim();

  if (priceText.toUpperCase().includes(normalizedCurrency)) {
    return priceText;
  }

  const numericPrice = Number(priceText.replace(/,/g, ''));

  if (!Number.isFinite(numericPrice)) {
    return `${priceText} ${normalizedCurrency}`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toLocaleString('en-US')} ${normalizedCurrency}`;
  }
};

const formatStatus = (status: string) =>
  status
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());



type ListingCardProps = {
  listing: MarketplaceListing;
  onViewDetail: () => void;
};

function ListingCard({ listing, onViewDetail }: ListingCardProps) {
  const cardListing = listing as ListingCardData;
  const [imageFailed, setImageFailed] = useState(false);


  const listingCurrency =
    cardListing.currency ??
    cardListing.priceCurrency ??
    'USD';
 
  const listingPrice =
   cardListing.price ??
    cardListing.priceAmount ??
    cardListing.discountedPrice ??
    cardListing.discounted_price ??
    cardListing.finalPrice ??
    cardListing.final_price ??

    null;
const listingPriceFormatted =
    cardListing.priceFormatted ?? null;
  const listingDescription =
    cardListing.shortDescription ?? cardListing.short_description ?? cardListing.description ?? '';
 const imageUrl =
    cardListing.coverImage ??
    cardListing.imageUrl ??
    cardListing.image_url ??
   cardListing.cover_image ??	
    cardListing.cover_image_url ??
   null;
     const optimizedImageUrl = getOptimizedImageUrl(imageUrl, 700);

  useEffect(() => {
    if (!hasText(imageUrl)) {
      console.log('Missing image for listing', cardListing.id, cardListing.title);
    }
   }, [cardListing.id, cardListing.title, imageUrl]);
   
    useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);


  const isAuction =
    toBoolean(cardListing.auctionEnabled) ||
    toBoolean(cardListing.auction_enabled) ||
    toBoolean(cardListing.isAuction) ||
    toBoolean(cardListing.is_auction);
  const saleStatus = (cardListing.saleStatus ?? cardListing.status ?? 'available').toLowerCase();
  const statusLabel = isAuction ? 'Auction' : formatStatus(saleStatus);
  const ratingFromObject = typeof cardListing.rating === 'object' ? cardListing.rating : null;
  const ratingAverage =
    toNumber(cardListing.avgRating) ??
    toNumber(cardListing.avg_rating) ??
    toNumber(typeof cardListing.rating === 'object' ? ratingFromObject?.average ?? ratingFromObject?.avg : cardListing.rating) ??
    toNumber(cardListing.reviewAverage) ??
    toNumber(cardListing.review_average);
  const reviewCount =
    toNumber(cardListing.reviewCount) ??
    toNumber(cardListing.review_count) ??
    toNumber(cardListing.reviews_count) ??
    toNumber(ratingFromObject?.count);
  const originalPriceValue = toNumber(cardListing.originalPrice ?? cardListing.original_price);
  const discountedPriceValue = toNumber(
    cardListing.discountedPrice ?? cardListing.discounted_price ?? cardListing.finalPrice ?? cardListing.final_price,
  );
  const hasDiscount =
    originalPriceValue !== null && discountedPriceValue !== null && originalPriceValue > discountedPriceValue;
  const price = useMemo(
 () => {
      if (hasText(listingPriceFormatted)) {
        return listingPriceFormatted;
      }

      if (listingPrice !== null && String(listingPrice).trim() !== '') {
        return formatPrice(listingPrice, listingCurrency);
      }

      return 'Contact for price';
    },
    [listingCurrency, listingPrice, listingPriceFormatted],
  );
  const originalPrice =
    hasDiscount && originalPriceValue !== null ? formatPrice(originalPriceValue, listingCurrency) : null;
  const discountPercent =
    hasDiscount && originalPriceValue !== null && discountedPriceValue !== null
      ? Math.round(((originalPriceValue - discountedPriceValue) / originalPriceValue) * 100)
      : null;
 const farmName =
    cardListing.farmName ??
    cardListing.sellerFarmName ??
    cardListing.shopName ??
    cardListing.storeName ??
    null;

  const farmLogo =
    cardListing.farmLogo ??
    cardListing.sellerFarmLogo ??
    cardListing.shopLogo ??
    cardListing.storeLogo ??
    null;	  	  

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {hasText(imageUrl) && !imageFailed ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
           resizeMethod="resize"
            fadeDuration={150}
            source={{ uri: optimizedImageUrl ?? imageUrl }}   
            style={styles.image}
             onError={(error) => {
              console.log('[IMAGE_LOAD_ERROR]', {
                id: cardListing.id,
                title: cardListing.title,
                imageUrl,
               optimizedImageUrl,				
                error: error?.nativeEvent,
              });
              setImageFailed(true);
            }} 
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>Bettavaro</Text>
          </View>
        )}
        <View style={[styles.auctionBadge, !isAuction && styles.statusBadge]}>
          <Text style={[styles.auctionBadgeText, !isAuction && styles.statusBadgeText]}>{statusLabel}</Text>
        </View>
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPercent ? `-${discountPercent}%` : 'SALE'}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {listing.title}
          </Text>
          <View style={styles.priceRow}>
            {originalPrice ? <Text style={styles.originalPrice}>{originalPrice}</Text> : null}
            <Text style={styles.price}>{price}</Text>
          </View>
        </View>

        {hasText(listingDescription) ? (
          <Text numberOfLines={2} style={styles.cardDescription}>
            {listingDescription.trim()}
          </Text>
        ) : null}

        <View style={styles.ratingRow}>
          <Text style={styles.stars}>{ratingAverage !== null ? '★★★★★' : '☆☆☆☆☆'}</Text>
          <Text style={styles.ratingText}>
            {ratingAverage !== null
              ? `${ratingAverage.toFixed(1)}${reviewCount !== null ? ` (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})` : ''}`
              : 'No reviews yet'}
          </Text>
        </View>

   {hasText(farmName) ? (
          <View style={styles.sellerRow}>
            {hasText(farmLogo) ? (
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={{ uri: farmLogo }}
                style={styles.sellerLogo}
              />
            ) : (
              <View style={styles.sellerInitial}>
                <Text style={styles.sellerInitialText}>{farmName.trim().charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text numberOfLines={1} style={styles.seller}>
              {farmName.trim()}
            </Text>
          </View>
        ) : null}
 

        <View style={styles.metaRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
          <Text style={styles.currency}>{listingCurrency.toUpperCase()}</Text>
        </View>

         <Pressable accessibilityRole="button" style={styles.detailButton} onPress={onViewDetail}>
          <Text style={styles.detailButtonText}>View Detail →</Text>
        </Pressable>
      </View>
    </View>
  );
}

type HomeScreenProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: HomeScreenProps = {}) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [status, setStatus] = useState<FeedStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const loadListings = useCallback(async (mode: 'loading' | 'refreshing' = 'loading') => {
    requestRef.current?.abort();

    const controller = new AbortController();
    requestRef.current = controller;

    setStatus(mode);
    setErrorMessage(null);

    try {
      const nextListings = await fetchMarketplaceListings(controller.signal);
      setListings(nextListings);
      setStatus('success');
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load marketplace listings.');
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    void loadListings();

    return () => requestRef.current?.abort();
  }, [loadListings]);

  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const isError = status === 'error';
  const isEmpty = status === 'success' && listings.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[colors.brand.emerald800]}
            refreshing={isRefreshing}
            tintColor={colors.accent.gold600}
            onRefresh={() => {
              void loadListings('refreshing');
            }}
          />
        }
        style={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Collector marketplace</Text>
          <Text style={styles.title}>Premium Bettas, live from Bettavaro</Text>
          <Text style={styles.subtitle}>Browse verified listings with auction and sale status surfaced up front.</Text>
        </View>

        {isLoading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color={colors.accent.gold600} size="large" />
            <Text style={styles.stateTitle}>Loading live listings</Text>
            <Text style={styles.stateCopy}>Fetching the latest marketplace feed.</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateTitle}>Marketplace unavailable</Text>
            <Text style={styles.stateCopy}>{errorMessage ?? 'Please check your connection and try again.'}</Text>
            <Pressable accessibilityRole="button" style={styles.retryButton} onPress={() => void loadListings()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {isEmpty ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateTitle}>No listings yet</Text>
            <Text style={styles.stateCopy}>Pull to refresh or check back soon for new collector-grade bettas.</Text>
          </View>
        ) : null}

        {!isLoading && !isError && listings.length > 0 ? (
          <View style={styles.feed}>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetail={() => {
                  if (navigation) {
					navigation.navigate('ListingDetail', {
					listingId: String(listing.id),
					listing,
					});
                    return;
                  }

                  console.log('View Detail', listing.id);
                }}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brand.emerald950,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  hero: {
    backgroundColor: colors.brand.emerald950,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
  },
  eyebrow: {
    color: colors.accent.gold500,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  },
  title: {
    color: colors.neutral[0],
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 39,
  },
  subtitle: {
    color: colors.brand.emerald100,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing[3],
  },
  feed: {
    gap: spacing[4],
    padding: spacing[4],
  },
  card: {
    ...shadows.card,
    backgroundColor: colors.neutral[0],
    borderColor: colors.brand.emerald100,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageFrame: {
    aspectRatio: 1.38,
    backgroundColor: colors.brand.emerald50,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    backgroundColor: colors.brand.emerald900,
    flex: 1,
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: colors.accent.gold200,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  auctionBadge: {
    backgroundColor: colors.accent.gold600,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    position: 'absolute',
    right: spacing[3],
    top: spacing[3],
  },
  auctionBadgeText: {
    color: colors.neutral[0],
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: colors.neutral[0],
    borderColor: colors.brand.emerald100,
    borderWidth: 1,
  },
  statusBadgeText: {
    color: colors.brand.emerald700,
  },
  discountBadge: {
    backgroundColor: colors.brand.emerald800,
    borderRadius: radii.pill,
    left: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    position: 'absolute',
    top: spacing[3],
  },
  discountBadgeText: {
    color: colors.accent.gold200,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  cardBody: {
    padding: spacing[4],
  },
  cardHeader: {
    gap: spacing[2],
  },
  priceRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  cardTitle: {
    color: colors.neutral[900],
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  originalPrice: {
    color: colors.neutral[500],
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  price: {
    color: colors.brand.emerald800,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  cardDescription: {
color: colors.neutral[700],
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing[2],
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  stars: {
    color: colors.accent.gold600,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  ratingText: {
    color: colors.neutral[500],
    fontSize: 13,
    fontWeight: '600',
  },
  sellerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  sellerLogo: {
    backgroundColor: colors.brand.emerald50,
    borderColor: colors.brand.emerald100,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    width: 32,
  },
  sellerInitial: {
    alignItems: 'center',
    backgroundColor: colors.brand.emerald800,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sellerInitialText: {
    color: colors.accent.gold200,
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  statusPill: {
    backgroundColor: colors.brand.emerald50,
    borderColor: colors.brand.emerald100,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  statusText: {
    color: colors.brand.emerald700,
    fontSize: 13,
    fontWeight: '700',
  },
  currency: {
    color: colors.neutral[500],
    fontSize: 13,
    fontWeight: '700',
  },
  seller: {
    color: colors.neutral[700],
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  detailButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand.emerald800,
    borderRadius: radii.pill,
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  detailButtonText: {
    color: colors.neutral[0],
    fontSize: 13,
    fontWeight: '700',
  },
  statePanel: {
    ...shadows.card,
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderColor: colors.neutral[200],
    borderRadius: radii.lg,
    borderWidth: 1,
    margin: spacing[4],
    padding: spacing[6],
  },
  stateTitle: {
    color: colors.neutral[900],
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing[3],
    textAlign: 'center',
  },
  stateCopy: {
    color: colors.neutral[500],
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.brand.emerald800,
    borderRadius: radii.pill,
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  retryButtonText: {
    color: colors.neutral[0],
    fontSize: 15,
    fontWeight: '700',
  },
});

