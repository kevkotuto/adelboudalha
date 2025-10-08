/**
 * Admin Product Form - Modal screen for creating/editing products and gift cards
 * Unified form that handles both types with complete image management
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { ImageUploadButton } from '@/components/ui/Inputs/ImageUploadButton';
import { NumberInput } from '@/components/ui/Inputs/NumberInput';
import { TextInput } from '@/components/ui/Inputs/TextInput';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminCategoriesService } from '@/services/adminCategoriesService';
import { adminGiftCardsService } from '@/services/adminGiftCardsService';
import { adminProductsService } from '@/services/adminProductsService';
import { uploadService } from '@/services/uploadService';
import type {
  AdminCategory,
  AdminGiftCard,
  AdminProduct,
  CreateGiftCardRequest,
  CreateProductRequest,
} from '@/types/admin';
import type { FileUpload } from '@/types';

type FormMode = 'create' | 'edit';
type ProductType = 'gift_card' | 'physical_product';

interface ImageState {
  id?: string;
  uri: string;
  isExisting: boolean;
  isNew: boolean;
  uploading: boolean;
  uploaded: boolean;
  toDelete: boolean;
  url?: string;
  error?: string;
}

// Form data pour Gift Card
interface GiftCardFormData {
  title: string;
  brand: string;
  categoryId: string;
  imageUrl: string;
  description: string;
  termsConditions: string;
  usageInstructions: string;
  amounts: string[];
  validityDays: string;
  region: string;
  discountPercentage: string;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  metaKeywords: string;
}

// Form data pour Produit Physique
interface ProductFormData {
  name: string;
  brand: string;
  categoryId: string;
  images: string[];
  price: string;
  originalPrice: string;
  description: string;
  specifications: { key: string; value: string }[];
  dimensionsLength: string;
  dimensionsWidth: string;
  dimensionsHeight: string;
  weightKg: string;
  stockQuantity: string;
  warrantyMonths: string;
  deliveryTimeDays: string;
  sku: string;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  metaKeywords: string;
}

export default function ProductFormScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    type?: string;
    id?: string;
  }>();

  const mode: FormMode = (params.mode as FormMode) || 'create';
  const type: ProductType = (params.type as ProductType) || 'gift_card';
  const itemId = params.id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  // Image management for products
  const [imageStates, setImageStates] = useState<ImageState[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Gift card image upload
  const [uploadingGiftCardImage, setUploadingGiftCardImage] = useState(false);

  // Form states
  const [giftCardForm, setGiftCardForm] = useState<GiftCardFormData>({
    title: '',
    brand: '',
    categoryId: '',
    imageUrl: '',
    description: '',
    termsConditions: '',
    usageInstructions: '',
    amounts: [''],
    validityDays: '365',
    region: 'FR',
    discountPercentage: '0',
    isPopular: false,
    isFeatured: false,
    isActive: true,
    metaKeywords: '',
  });

  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    brand: '',
    categoryId: '',
    images: [],
    price: '',
    originalPrice: '',
    description: '',
    specifications: [{ key: '', value: '' }],
    dimensionsLength: '',
    dimensionsWidth: '',
    dimensionsHeight: '',
    weightKg: '',
    stockQuantity: '0',
    warrantyMonths: '12',
    deliveryTimeDays: '3',
    sku: '',
    isPopular: false,
    isFeatured: false,
    isActive: true,
    metaKeywords: '',
  });

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load existing data if editing
  useEffect(() => {
    if (mode === 'edit' && itemId) {
      loadExistingData();
    }
  }, [mode, itemId, type]);

  const loadCategories = async () => {
    try {
      const cats = await adminCategoriesService.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadExistingData = async () => {
    if (!itemId) return;

    try {
      setLoading(true);

      if (type === 'gift_card') {
        const giftCard = await adminGiftCardsService.getGiftCardById(itemId);
        fillGiftCardForm(giftCard);
      } else {
        const product = await adminProductsService.getProductById(itemId);
        fillProductForm(product);
      }
    } catch (error) {
      console.error('Failed to load item:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fillGiftCardForm = (giftCard: AdminGiftCard) => {
    setGiftCardForm({
      title: giftCard.title || '',
      brand: giftCard.brand || '',
      categoryId: giftCard.categoryId || '',
      imageUrl: giftCard.imageUrl || '',
      description: giftCard.description || '',
      termsConditions: giftCard.termsConditions || '',
      usageInstructions: giftCard.usageInstructions || '',
      amounts:
        giftCard.fixedAmounts && giftCard.fixedAmounts.length > 0
          ? giftCard.fixedAmounts.map((a) => String(Number(a)))
          : [''],
      validityDays: String(giftCard.validityDays || 365),
      region: giftCard.region || 'FR',
      discountPercentage: String(giftCard.discountPercentage || 0),
      isPopular: giftCard.isPopular || false,
      isFeatured: giftCard.isFeatured || false,
      isActive: giftCard.isActive !== false,
      metaKeywords: Array.isArray(giftCard.metaKeywords)
        ? giftCard.metaKeywords.join(', ')
        : '',
    });
  };

  const fillProductForm = (product: AdminProduct) => {
    // Parse specifications
    let specs: { key: string; value: string }[] = [{ key: '', value: '' }];
    if (product.specifications) {
      if (
        typeof product.specifications === 'object' &&
        !Array.isArray(product.specifications)
      ) {
        specs = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      } else if (Array.isArray(product.specifications)) {
        specs = product.specifications;
      }
    }

    // Parse dimensions
    let dimLength = '',
      dimWidth = '',
      dimHeight = '';
    if (product.dimensionsCm) {
      const parts = String(product.dimensionsCm)
        .split('x')
        .map((p) => p.trim());
      dimLength = parts[0] || '';
      dimWidth = parts[1] || '';
      dimHeight = parts[2] || '';
    }

    setProductForm({
      name: product.name || '',
      brand: product.brand || '',
      categoryId: product.categoryId || '',
      images: Array.isArray(product.images) ? product.images : [],
      price: String(Number(product.price)),
      originalPrice: product.originalPrice
        ? String(Number(product.originalPrice))
        : '',
      description: product.description || '',
      specifications: specs.length > 0 ? specs : [{ key: '', value: '' }],
      dimensionsLength: dimLength,
      dimensionsWidth: dimWidth,
      dimensionsHeight: dimHeight,
      weightKg: product.weightKg ? String(product.weightKg) : '',
      stockQuantity: String(product.stockQuantity || 0),
      warrantyMonths: String(product.warrantyMonths || 12),
      deliveryTimeDays: String(product.deliveryTimeDays || 3),
      sku: product.sku || '',
      isPopular: product.isPopular || false,
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
      metaKeywords: Array.isArray(product.metaKeywords)
        ? product.metaKeywords.join(', ')
        : '',
    });

    // Initialize existing images
    if (Array.isArray(product.images) && product.images.length > 0) {
      const existingImages: ImageState[] = product.images.map((url) => ({
        uri: url,
        url,
        isExisting: true,
        isNew: false,
        uploading: false,
        uploaded: true,
        toDelete: false,
      }));
      setImageStates(existingImages);
    }
  };

  // Image picker for products
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "Autorisation d'accès aux photos nécessaire"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages: ImageState[] = result.assets.map((asset) => ({
        uri: asset.uri,
        isExisting: false,
        isNew: true,
        uploading: false,
        uploaded: false,
        toDelete: false,
      }));

      setImageStates((prev) => [...prev, ...newImages]);

      // Upload immediately
      await uploadNewImages(newImages);
    }
  };

  const uploadNewImages = async (images: ImageState[]) => {
    try {
      setUploadingImages(true);

      for (const imageState of images) {
        // Update to uploading
        setImageStates((prev) =>
          prev.map((img) =>
            img.uri === imageState.uri ? { ...img, uploading: true } : img
          )
        );

        try {
          const fileName =
            imageState.uri.split('/').pop() || `image_${Date.now()}.jpg`;
          const fileUpload: FileUpload = {
            uri: imageState.uri,
            type: 'image/jpeg',
            name: fileName,
          };

          const response = await uploadService.uploadProductImages([
            fileUpload,
          ]);

          if (response.files && response.files.length > 0) {
            const uploadedUrl = response.files[0].url;

            // Update to uploaded
            setImageStates((prev) =>
              prev.map((img) =>
                img.uri === imageState.uri
                  ? {
                      ...img,
                      uploading: false,
                      uploaded: true,
                      url: uploadedUrl,
                    }
                  : img
              )
            );

            // Add to product form images
            setProductForm((prev) => ({
              ...prev,
              images: [...prev.images, uploadedUrl],
            }));
          }
        } catch (error) {
          console.error('Upload failed:', error);
          setImageStates((prev) =>
            prev.map((img) =>
              img.uri === imageState.uri
                ? {
                    ...img,
                    uploading: false,
                    error: 'Upload échoué',
                  }
                : img
            )
          );
        }
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (imageState: ImageState) => {
    if (imageState.isExisting) {
      // Mark for deletion
      setImageStates((prev) =>
        prev.map((img) =>
          img.uri === imageState.uri ? { ...img, toDelete: true } : img
        )
      );
    } else {
      // Remove new image
      setImageStates((prev) => prev.filter((img) => img.uri !== imageState.uri));
    }

    // Remove from form images array
    if (imageState.url) {
      setProductForm((prev) => ({
        ...prev,
        images: prev.images.filter((url) => url !== imageState.url),
      }));
    }
  };

  const handleSave = async () => {
    if (type === 'gift_card') {
      await handleSaveGiftCard();
    } else {
      await handleSaveProduct();
    }
  };

  const handleSaveGiftCard = async () => {
    if (
      !giftCardForm.title.trim() ||
      !giftCardForm.categoryId ||
      !giftCardForm.imageUrl
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);

      const amounts = giftCardForm.amounts
        .map((a) => parseFloat(a))
        .filter((a) => !isNaN(a) && a > 0)
        .map((a) => Math.round(a));

      if (amounts.length === 0) {
        Alert.alert('Erreur', 'Veuillez ajouter au moins un montant');
        return;
      }

      const data: CreateGiftCardRequest = {
        title: giftCardForm.title.trim(),
        brand: giftCardForm.brand.trim(),
        categoryId: giftCardForm.categoryId,
        description: giftCardForm.description.trim(),
        termsConditions: giftCardForm.termsConditions.trim(),
        usageInstructions: giftCardForm.usageInstructions.trim(),
        imageUrl: giftCardForm.imageUrl.trim(),
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts),
        fixedAmounts: amounts,
        discountPercentage: parseFloat(giftCardForm.discountPercentage) || 0,
        isPopular: giftCardForm.isPopular,
        isFeatured: giftCardForm.isFeatured,
        validityDays: parseInt(giftCardForm.validityDays) || 365,
        metaKeywords: giftCardForm.metaKeywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k),
      };

      if (mode === 'edit' && itemId) {
        await adminGiftCardsService.updateGiftCard(itemId, data);
        Alert.alert('Succès', 'Gift card mise à jour avec succès');
      } else {
        await adminGiftCardsService.createGiftCard(data);
        Alert.alert('Succès', 'Gift card créée avec succès');
      }

      router.back();
    } catch (error) {
      console.error('Error saving gift card:', error);
      Alert.alert(
        'Erreur',
        mode === 'edit'
          ? 'Impossible de mettre à jour la gift card'
          : 'Impossible de créer la gift card'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProduct = async () => {
    const missingFields: string[] = [];

    if (!productForm.name.trim()) missingFields.push('Nom');
    if (!productForm.price.trim()) missingFields.push('Prix');
    if (!productForm.categoryId) missingFields.push('Catégorie');

    if (missingFields.length > 0) {
      Alert.alert(
        'Champs manquants',
        `Veuillez remplir : ${missingFields.join(', ')}`
      );
      return;
    }

    try {
      setSaving(true);

      // Build specifications object
      const specs: Record<string, any> = {};
      productForm.specifications.forEach((spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          specs[spec.key.trim()] = spec.value.trim();
        }
      });

      // Get final images list (exclude marked for deletion)
      const finalImages = imageStates
        .filter((img) => !img.toDelete && img.uploaded)
        .map((img) => img.url!)
        .filter((url) => url);

      const data: CreateProductRequest = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        categoryId: productForm.categoryId,
        description: productForm.description.trim(),
        price: Math.round(parseFloat(productForm.price)),
        originalPrice: productForm.originalPrice
          ? Math.round(parseFloat(productForm.originalPrice))
          : undefined,
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
        sku: productForm.sku.trim() || `SKU-${Date.now()}`,
        images: finalImages,
        specifications: Object.keys(specs).length > 0 ? specs : undefined,
        dimensionsCm:
          productForm.dimensionsLength &&
          productForm.dimensionsWidth &&
          productForm.dimensionsHeight
            ? {
                length: parseFloat(productForm.dimensionsLength),
                width: parseFloat(productForm.dimensionsWidth),
                height: parseFloat(productForm.dimensionsHeight),
              }
            : undefined,
        weightKg: productForm.weightKg
          ? parseFloat(productForm.weightKg)
          : undefined,
        warrantyMonths: productForm.warrantyMonths
          ? parseInt(productForm.warrantyMonths)
          : undefined,
        deliveryTimeDays: productForm.deliveryTimeDays
          ? parseInt(productForm.deliveryTimeDays)
          : undefined,
        isPopular: productForm.isPopular,
        isFeatured: productForm.isFeatured,
        metaKeywords: productForm.metaKeywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k),
      };

      if (mode === 'edit' && itemId) {
        await adminProductsService.updateProduct(itemId, data);
        Alert.alert('Succès', 'Produit mis à jour avec succès');
      } else {
        await adminProductsService.createProduct(data);
        Alert.alert('Succès', 'Produit créé avec succès');
      }

      router.back();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert(
        'Erreur',
        mode === 'edit'
          ? 'Impossible de mettre à jour le produit'
          : 'Impossible de créer le produit'
      );
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    if (mode === 'create') {
      return type === 'gift_card' ? 'Nouvelle Gift Card' : 'Nouveau Produit';
    }
    return type === 'gift_card' ? 'Modifier Gift Card' : 'Modifier Produit';
  };

  const filteredCategories =
    type === 'gift_card'
      ? categories.filter(
          (cat) => cat.type === 'GIFT_CARD' || cat.type === 'BOTH'
        )
      : categories.filter(
          (cat) => cat.type === 'PHYSICAL_PRODUCT' || cat.type === 'BOTH'
        );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </Pressable>
        <Title level={3}>{getTitle()}</Title>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {type === 'gift_card' ? (
          // GIFT CARD FORM
          <>
            <TextInput
              label="Titre *"
              value={giftCardForm.title}
              onChangeText={(text) =>
                setGiftCardForm({ ...giftCardForm, title: text })
              }
              placeholder="Ex: Carte PlayStation 50€"
            />

            <TextInput
              label="Marque *"
              value={giftCardForm.brand}
              onChangeText={(text) =>
                setGiftCardForm({ ...giftCardForm, brand: text })
              }
              placeholder="Ex: PlayStation"
            />

            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>Catégorie *</Caption>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filteredCategories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      giftCardForm.categoryId === cat.id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() =>
                      setGiftCardForm({ ...giftCardForm, categoryId: cat.id })
                    }
                  >
                    <Caption
                      style={[
                        styles.categoryChipText,
                        giftCardForm.categoryId === cat.id &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Caption>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Gift Card Image Upload */}
            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>Image *</Caption>
              <View style={styles.giftCardImageUpload}>
                {giftCardForm.imageUrl && (
                  <Image
                    source={{ uri: giftCardForm.imageUrl }}
                    style={styles.giftCardImagePreview}
                  />
                )}
                <ImageUploadButton
                  type="gift-card"
                  currentImageUrl={giftCardForm.imageUrl}
                  onUploadComplete={(url) => {
                    setGiftCardForm({ ...giftCardForm, imageUrl: url });
                    setUploadingGiftCardImage(false);
                  }}
                  onUploadStart={() => setUploadingGiftCardImage(true)}
                  onUploadError={() => setUploadingGiftCardImage(false)}
                  size="medium"
                  disabled={uploadingGiftCardImage}
                />
                {uploadingGiftCardImage && (
                  <Caption color="secondary" style={{ marginTop: Spacing.xs }}>
                    Upload en cours...
                  </Caption>
                )}
              </View>
            </View>

            <TextInput
              label="Description *"
              value={giftCardForm.description}
              onChangeText={(text) =>
                setGiftCardForm({ ...giftCardForm, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Conditions d'utilisation"
              value={giftCardForm.termsConditions}
              onChangeText={(text) =>
                setGiftCardForm({ ...giftCardForm, termsConditions: text })
              }
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Instructions d'utilisation"
              value={giftCardForm.usageInstructions}
              onChangeText={(text) =>
                setGiftCardForm({ ...giftCardForm, usageInstructions: text })
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>
                Montants disponibles (FCFA) *
              </Caption>
              {giftCardForm.amounts.map((amount, index) => (
                <View key={index} style={styles.amountRow}>
                  <TextInput
                    value={amount}
                    onChangeText={(text) => {
                      const newAmounts = [...giftCardForm.amounts];
                      newAmounts[index] = text;
                      setGiftCardForm({ ...giftCardForm, amounts: newAmounts });
                    }}
                    placeholder="Ex: 5000"
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                  {giftCardForm.amounts.length > 1 ? (
                    <Pressable
                      onPress={() => {
                        const newAmounts = giftCardForm.amounts.filter(
                          (_, i) => i !== index
                        );
                        setGiftCardForm({
                          ...giftCardForm,
                          amounts: newAmounts,
                        });
                      }}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#f44336" />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable
                onPress={() =>
                  setGiftCardForm({
                    ...giftCardForm,
                    amounts: [...giftCardForm.amounts, ''],
                  })
                }
                style={styles.addButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={Colors.primary}
                />
                <Caption color="accent">Ajouter un montant</Caption>
              </Pressable>
            </View>

            <NumberInput
              label="Validité (jours)"
              value={
                giftCardForm.validityDays
                  ? parseFloat(giftCardForm.validityDays)
                  : undefined
              }
              onValueChange={(value) =>
                setGiftCardForm({ ...giftCardForm, validityDays: value.toString() })
              }
              placeholder="365"
            />

            <NumberInput
              label="Réduction (%)"
              value={
                giftCardForm.discountPercentage
                  ? parseFloat(giftCardForm.discountPercentage)
                  : undefined
              }
              onValueChange={(value) =>
                setGiftCardForm({
                  ...giftCardForm,
                  discountPercentage: value.toString(),
                })
              }
              placeholder="0"
            />

            <TextInput
              label="Mots-clés (séparés par des virgules)"
              value={giftCardForm.metaKeywords}
              onChangeText={(text) =>
                setGiftCardForm({ ...giftCardForm, metaKeywords: text })
              }
              placeholder="gaming, playstation, jeux"
            />

            <View style={styles.switchContainer}>
              <Paragraph>Populaire</Paragraph>
              <Switch
                value={giftCardForm.isPopular}
                onValueChange={(value) =>
                  setGiftCardForm({ ...giftCardForm, isPopular: value })
                }
                trackColor={{ true: Colors.primary }}
              />
            </View>

            <View style={styles.switchContainer}>
              <Paragraph>À la une</Paragraph>
              <Switch
                value={giftCardForm.isFeatured}
                onValueChange={(value) =>
                  setGiftCardForm({ ...giftCardForm, isFeatured: value })
                }
                trackColor={{ true: Colors.primary }}
              />
            </View>

            <View style={styles.switchContainer}>
              <Paragraph>Actif</Paragraph>
              <Switch
                value={giftCardForm.isActive}
                onValueChange={(value) =>
                  setGiftCardForm({ ...giftCardForm, isActive: value })
                }
                trackColor={{ true: Colors.primary }}
              />
            </View>
          </>
        ) : (
          // PRODUCT FORM
          <>
            <TextInput
              label="Nom *"
              value={productForm.name}
              onChangeText={(text) =>
                setProductForm({ ...productForm, name: text })
              }
              placeholder="Ex: Samsung Galaxy S24"
            />

            <TextInput
              label="Marque"
              value={productForm.brand}
              onChangeText={(text) =>
                setProductForm({ ...productForm, brand: text })
              }
              placeholder="Ex: Samsung"
            />

            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>Catégorie *</Caption>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filteredCategories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      productForm.categoryId === cat.id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() =>
                      setProductForm({ ...productForm, categoryId: cat.id })
                    }
                  >
                    <Caption
                      style={[
                        styles.categoryChipText,
                        productForm.categoryId === cat.id &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Caption>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Images Management */}
            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>Images</Caption>
              {uploadingImages ? (
                <Caption color="secondary" style={{ marginBottom: Spacing.xs }}>
                  Upload en cours...
                </Caption>
              ) : null}

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {imageStates.map((imageState, index) =>
                  imageState.toDelete ? null : (
                    <View key={index} style={styles.imagePreview}>
                      <Image
                        source={{ uri: imageState.uri }}
                        style={styles.previewImage}
                      />

                      {/* Upload status overlay */}
                      {imageState.uploading ? (
                        <View style={styles.uploadOverlay}>
                          <LoadingSpinner size="small" color={Colors.white} />
                        </View>
                      ) : null}

                      {imageState.uploaded ? (
                        <View style={styles.uploadSuccessOverlay}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#4CAF50"
                          />
                        </View>
                      ) : null}

                      {imageState.error ? (
                        <View style={styles.uploadErrorOverlay}>
                          <Ionicons
                            name="alert-circle"
                            size={24}
                            color="#f44336"
                          />
                        </View>
                      ) : null}

                      {/* Remove button */}
                      {imageState.uploaded || imageState.isExisting ? (
                        <Pressable
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(imageState)}
                        >
                          <Ionicons name="close-circle" size={24} color="#f44336" />
                        </Pressable>
                      ) : null}

                      {/* Existing badge */}
                      {imageState.isExisting ? (
                        <View style={styles.existingBadge}>
                          <Caption
                            color="inverse"
                            style={styles.existingBadgeText}
                          >
                            Existante
                          </Caption>
                        </View>
                      ) : null}
                    </View>
                  )
                )}

                <Pressable style={styles.addImageButton} onPress={handlePickImage}>
                  <Ionicons
                    name="add-circle-outline"
                    size={40}
                    color={Colors.primary}
                  />
                  <Caption color="accent" style={{ marginTop: Spacing.xs }}>
                    Ajouter
                  </Caption>
                </Pressable>
              </ScrollView>
            </View>

            <NumberInput
              label="Prix (FCFA) *"
              value={
                productForm.price ? parseFloat(productForm.price) : undefined
              }
              onValueChange={(value) =>
                setProductForm({ ...productForm, price: value.toString() })
              }
              placeholder="Ex: 500000"
            />

            <NumberInput
              label="Prix original (FCFA)"
              value={
                productForm.originalPrice
                  ? parseFloat(productForm.originalPrice)
                  : undefined
              }
              onValueChange={(value) =>
                setProductForm({ ...productForm, originalPrice: value.toString() })
              }
              placeholder="Ex: 600000"
            />

            <NumberInput
              label="Stock *"
              value={
                productForm.stockQuantity
                  ? parseFloat(productForm.stockQuantity)
                  : undefined
              }
              onValueChange={(value) =>
                setProductForm({ ...productForm, stockQuantity: value.toString() })
              }
              placeholder="Ex: 10"
            />

            <TextInput
              label="Description"
              value={productForm.description}
              onChangeText={(text) =>
                setProductForm({ ...productForm, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="SKU"
              value={productForm.sku}
              onChangeText={(text) =>
                setProductForm({ ...productForm, sku: text })
              }
              placeholder="SKU-12345"
            />

            <TextInput
              label="Mots-clés (séparés par des virgules)"
              value={productForm.metaKeywords}
              onChangeText={(text) =>
                setProductForm({ ...productForm, metaKeywords: text })
              }
              placeholder="smartphone, android, 5g"
            />

            <View style={styles.switchContainer}>
              <Paragraph>Populaire</Paragraph>
              <Switch
                value={productForm.isPopular}
                onValueChange={(value) =>
                  setProductForm({ ...productForm, isPopular: value })
                }
                trackColor={{ true: Colors.primary }}
              />
            </View>

            <View style={styles.switchContainer}>
              <Paragraph>À la une</Paragraph>
              <Switch
                value={productForm.isFeatured}
                onValueChange={(value) =>
                  setProductForm({ ...productForm, isFeatured: value })
                }
                trackColor={{ true: Colors.primary }}
              />
            </View>

            <View style={styles.switchContainer}>
              <Paragraph>Actif</Paragraph>
              <Switch
                value={productForm.isActive}
                onValueChange={(value) =>
                  setProductForm({ ...productForm, isActive: value })
                }
                trackColor={{ true: Colors.primary }}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          onPress={handleSave}
          loading={saving}
          disabled={saving || uploadingImages || uploadingGiftCardImage}
          fullWidth
        >
          {mode === 'edit' ? 'Mettre à jour' : 'Créer'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  backButton: {
    padding: Spacing.xs,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  fieldContainer: {
    marginBottom: Spacing.lg,
  },

  fieldLabel: {
    marginBottom: Spacing.sm,
    fontFamily: 'Ubuntu_500Medium',
  },

  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginRight: Spacing.sm,
  },

  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  categoryChipText: {
    fontFamily: 'Ubuntu_500Medium',
  },

  categoryChipTextActive: {
    color: Colors.black,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  removeButton: {
    padding: Spacing.sm,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },

  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.card,
    marginRight: Spacing.sm,
    position: 'relative',
    backgroundColor: Colors.gray[200],
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.card,
  },

  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
  },

  uploadSuccessOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  uploadErrorOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  removeImageButton: {
    position: 'absolute',
    top: 4,
    left: 4,
  },

  existingBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },

  existingBadgeText: {
    fontSize: 10,
  },

  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  giftCardImageUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  giftCardImagePreview: {
    width: 150,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[200],
  },
});
