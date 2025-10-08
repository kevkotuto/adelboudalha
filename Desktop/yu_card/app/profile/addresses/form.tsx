import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import userService, { userHelpers } from '@/services/userService';
import { CreateAddressRequest } from '@/types';

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function AddressFormScreen() {
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!params.id;
  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form state - Pré-remplir avec les données de l'utilisateur
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('CI');
  const [isDefault, setIsDefault] = useState(false);
  const [addressType, setAddressType] = useState<'SHIPPING' | 'BILLING' | 'BOTH'>('BOTH');

  // Map state
  const [region, setRegion] = useState<Region>({
    latitude: 5.3599517, // Abidjan
    longitude: -4.0082563,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 5.3599517,
    longitude: -4.0082563,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');

      if (status === 'granted' && !isEditMode) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const newRegion: Region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setRegion(newRegion);
          setMarkerPosition({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.log('Error getting location:', error);
        }
      }
    })();
  }, []);

  // Load address if editing
  useEffect(() => {
    if (isEditMode && params.id) {
      loadAddress(params.id);
    }
  }, [isEditMode, params.id]);

  const loadAddress = async (addressId: string) => {
    try {
      const addresses = await userService.getAddresses();
      const address = addresses.find(addr => addr.id === addressId);

      if (address) {
        setFullName(address.fullName);
        setPhone(address.phone);
        setAddressLine1(address.addressLine1);
        setAddressLine2(address.addressLine2 || '');
        setCity(address.city);
        setStateProvince(address.stateProvince || '');
        setPostalCode(address.postalCode || '');
        setCountry(address.country);
        setIsDefault(address.isDefault);
        setAddressType(address.type || 'BOTH');

        // Update map if coordinates are available
        if (address.latitude && address.longitude) {
          const newRegion = {
            latitude: address.latitude,
            longitude: address.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setRegion(newRegion);
          setMarkerPosition({
            latitude: address.latitude,
            longitude: address.longitude,
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to load address:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'adresse');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Permission requise',
        'Veuillez autoriser l\'accès à votre position pour utiliser cette fonctionnalité.'
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Animate to location
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Try reverse geocoding
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position');
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (address) {
        if (address.street && !addressLine1) {
          setAddressLine1(address.street);
        }
        if (address.city && !city) {
          setCity(address.city);
        }
        if (address.region && !stateProvince) {
          setStateProvince(address.region);
        }
        if (address.postalCode && !postalCode) {
          setPostalCode(address.postalCode);
        }
        if (address.isoCountryCode) {
          setCountry(address.isoCountryCode);
        }
      }
    } catch (geocodeError) {
      console.log('Reverse geocoding failed:', geocodeError);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  // Recherche avec Nominatim (OpenStreetMap) - gratuit et sans clé API
  const searchPlaces = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 3) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    // Debounce la recherche
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🔍 Recherche pour:', query);

        // Utiliser Nominatim API (OpenStreetMap) pour la recherche
        // Centrer la recherche sur la Côte d'Ivoire
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(query)}&` +
          `countrycodes=ci&` + // Limiter à la Côte d'Ivoire
          `limit=10&` +
          `addressdetails=1`,
          {
            headers: {
              'User-Agent': 'YuCardApp/1.0', // Requis par Nominatim
            },
          }
        );

        const data = await response.json();
        console.log('📍 Résultats trouvés:', data.length);

        if (data && data.length > 0) {
          const enrichedPredictions: PlacePrediction[] = data.slice(0, 8).map((place: any) => {
            // Construire un affichage lisible
            const mainText = place.address?.city ||
                           place.address?.town ||
                           place.address?.village ||
                           place.address?.suburb ||
                           place.address?.neighbourhood ||
                           place.name ||
                           'Lieu';

            const secondaryParts = [
              place.address?.road,
              place.address?.suburb !== mainText ? place.address?.suburb : null,
              place.address?.state,
            ].filter(Boolean);

            const secondaryText = secondaryParts.length > 0
              ? secondaryParts.join(', ')
              : 'Côte d\'Ivoire';

            console.log('✅ Suggestion:', mainText, '-', secondaryText);

            return {
              description: `${mainText}, ${secondaryText}`,
              place_id: `${place.lat}-${place.lon}`,
              structured_formatting: {
                main_text: mainText,
                secondary_text: secondaryText,
              },
            };
          });

          console.log('📋 Total suggestions:', enrichedPredictions.length);
          setPredictions(enrichedPredictions);
        } else {
          console.log('❌ Aucun résultat');
          setPredictions([]);
        }
      } catch (error) {
        console.error('❌ Search error:', error);
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    Keyboard.dismiss();
    setPredictions([]);
    setSearchQuery('');
    setIsSearching(false);

    try {
      // Extraire lat/lng du place_id
      const coords = prediction.place_id.split('-');
      if (coords.length === 2) {
        const latitude = parseFloat(coords[0]);
        const longitude = parseFloat(coords[1]);

        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarkerPosition({ latitude, longitude });
        mapRef.current?.animateToRegion(newRegion, 1000);

        // Reverse geocode pour remplir le formulaire
        await reverseGeocode(latitude, longitude);
      }
    } catch (error) {
      console.error('Error selecting place:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner cette position');
    }
  };

  const handleSave = async () => {
    const addressData: CreateAddressRequest = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      stateProvince: stateProvince.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country || 'CI',
      isDefault,
      type: addressType,
    };

    const validation = userHelpers?.validateAddress(addressData) || {
      valid: true,
      errors: [],
    };

    if (!validation.valid) {
      Alert.alert('Erreur de validation', validation.errors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && params.id) {
        await userService.updateAddress(params.id, addressData);
        Alert.alert('Succès', 'Adresse mise à jour avec succès', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await userService.createAddress(addressData);
        Alert.alert('Succès', 'Adresse créée avec succès', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to save address:', error);

      // Gestion améliorée des erreurs du backend
      let errorMessage = 'Impossible de sauvegarder l\'adresse';

      if (error.message) {
        // Si l'erreur contient plusieurs messages d'erreur
        if (error.message.includes('[Error:')) {
          const matches = error.message.match(/\[Error: ([^\]]+)\]/);
          if (matches && matches[1]) {
            errorMessage = matches[1].split(', ').join('\n');
          }
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;

    Alert.alert(
      'Supprimer l\'adresse',
      'Êtes-vous sûr de vouloir supprimer cette adresse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAddress(params.id!);
              Alert.alert('Succès', 'Adresse supprimée', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'adresse');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <Container>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </Pressable>
            <Title level={4}>{isEditMode ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</Title>
            <View style={styles.headerSpacer} />
          </View>
        </Container>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Map Section - Cliquable pour agrandir */}
          <Pressable onPress={() => setShowFullMap(true)}>
            <View style={styles.mapSection}>
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={region}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  pointerEvents="none"
                >
                  <Marker coordinate={markerPosition} />
                </MapView>

                {/* Overlay pour indiquer qu'on peut cliquer */}
                <View style={styles.mapOverlay}>
                  <View style={styles.mapOverlayContent}>
                    <Ionicons name="expand" size={24} color={Colors.white} />
                    <Paragraph style={styles.mapOverlayText}>
                      Appuyez pour sélectionner la position
                    </Paragraph>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Form Section */}
          <Container>
            <Card style={styles.formCard}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  NOM COMPLET *
                </Caption>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Entrez le nom complet (min. 2 caractères)"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  TÉLÉPHONE *
                </Caption>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+225 01 23 45 67 89"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="phone-pad"
                />
                {user.phone && phone === user.phone && (
                  <Caption color="secondary" style={styles.hint}>
                    Utilise votre numéro de téléphone
                  </Caption>
                )}
              </View>

              {/* Address Line 1 */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  ADRESSE *
                </Caption>
                <TextInput
                  style={styles.input}
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                  placeholder="Rue, numéro, quartier (min. 5 caractères)"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* Address Line 2 */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  COMPLÉMENT D'ADRESSE
                </Caption>
                <TextInput
                  style={styles.input}
                  value={addressLine2}
                  onChangeText={setAddressLine2}
                  placeholder="Appartement, étage, bâtiment"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* City */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  VILLE *
                </Caption>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Abidjan (min. 2 caractères)"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* State/Province */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  RÉGION
                </Caption>
                <TextInput
                  style={styles.input}
                  value={stateProvince}
                  onChangeText={setStateProvince}
                  placeholder="Lagunes"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* Postal Code */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  CODE POSTAL
                </Caption>
                <TextInput
                  style={styles.input}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="00225"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="number-pad"
                />
              </View>

              {/* Address Type */}
              <View style={styles.inputGroup}>
                <Caption color="secondary" style={styles.label}>
                  TYPE D'ADRESSE
                </Caption>
                <View style={styles.typeButtons}>
                  <Pressable
                    style={[
                      styles.typeButton,
                      addressType === 'SHIPPING' && styles.typeButtonActive,
                    ]}
                    onPress={() => setAddressType('SHIPPING')}
                  >
                    <Paragraph
                      style={[
                        styles.typeButtonText,
                        addressType === 'SHIPPING' && styles.typeButtonTextActive,
                      ]}
                    >
                      Livraison
                    </Paragraph>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.typeButton,
                      addressType === 'BILLING' && styles.typeButtonActive,
                    ]}
                    onPress={() => setAddressType('BILLING')}
                  >
                    <Paragraph
                      style={[
                        styles.typeButtonText,
                        addressType === 'BILLING' && styles.typeButtonTextActive,
                      ]}
                    >
                      Facturation
                    </Paragraph>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.typeButton,
                      addressType === 'BOTH' && styles.typeButtonActive,
                    ]}
                    onPress={() => setAddressType('BOTH')}
                  >
                    <Paragraph
                      style={[
                        styles.typeButtonText,
                        addressType === 'BOTH' && styles.typeButtonTextActive,
                      ]}
                    >
                      Les deux
                    </Paragraph>
                  </Pressable>
                </View>
              </View>

              {/* Default Address */}
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Paragraph>Définir comme adresse par défaut</Paragraph>
                  <Caption color="secondary">
                    Cette adresse sera utilisée par défaut pour vos commandes
                  </Caption>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </Card>

            {/* Action Buttons */}
            <Button
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
              size="lg"
            >
              {isEditMode ? 'Mettre à jour' : 'Ajouter l\'adresse'}
            </Button>

            {isEditMode && (
              <Button
                variant="outline"
                onPress={handleDelete}
                style={styles.deleteButton}
                size="lg"
              >
                Supprimer l'adresse
              </Button>
            )}

            <View style={styles.bottomPadding} />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Map Modal */}
      <Modal
        visible={showFullMap}
        animationType="slide"
        onRequestClose={() => setShowFullMap(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowFullMap(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.text.primary} />
            </Pressable>
            <Title level={5}>Sélectionnez votre position</Title>
            <Pressable onPress={getCurrentLocation} style={styles.headerActionButton}>
              <Ionicons name="locate" size={24} color={Colors.primary} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={searchPlaces}
                placeholder="Rechercher une adresse..."
                placeholderTextColor={Colors.text.tertiary}
                returnKeyType="search"
              />
              {isSearching && <LoadingSpinner size="small" />}
              {searchQuery.length > 0 && !isSearching && (
                <Pressable onPress={() => { setSearchQuery(''); setPredictions([]); }}>
                  <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
                </Pressable>
              )}
            </View>

            {/* Search Results */}
            {predictions.length > 0 && (
              <View style={styles.searchResults}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {predictions.map((prediction, index) => (
                    <Pressable
                      key={index}
                      style={styles.searchResultItem}
                      onPress={() => handleSelectPlace(prediction)}
                    >
                      <Ionicons name="location" size={20} color={Colors.primary} />
                      <View style={styles.searchResultText}>
                        <Paragraph numberOfLines={1}>
                          {prediction.structured_formatting.main_text}
                        </Paragraph>
                        <Caption color="secondary" numberOfLines={1}>
                          {prediction.structured_formatting.secondary_text}
                        </Caption>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Full Map */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.fullMap}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            showsUserLocation={hasLocationPermission}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          </MapView>

          {/* Confirm Button */}
          <View style={styles.modalFooter}>
            <Button onPress={() => setShowFullMap(false)} size="lg">
              Confirmer la position
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  mapSection: {
    marginBottom: Spacing.lg,
  },

  mapContainer: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapOverlayContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },

  mapOverlayText: {
    color: Colors.white,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },

  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  inputGroup: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },

  hint: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },

  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },

  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  typeButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },

  typeButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  switchLabel: {
    flex: 1,
    marginRight: Spacing.md,
  },

  saveButton: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },

  deleteButton: {
    marginHorizontal: Spacing.sm,
  },

  bottomPadding: {
    height: Spacing.xl,
  },

  // Full Map Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    zIndex: 10,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 4,
  },

  searchResults: {
    maxHeight: 250,
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  searchResultText: {
    flex: 1,
  },

  fullMap: {
    flex: 1,
  },

  modalFooter: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
});
